const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

exports.getRecommendations = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const summaries = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startOfPrev }, type: { $in: ['income', 'expense'] } } },
            { $group: { _id: { type: '$type', isCurrent: { $gte: ['$date', startOfMonth] } }, total: { $sum: '$amount' } } },
        ]);

        const get = (type, isCurrent) => summaries.find((s) => s._id.type === type && s._id.isCurrent === isCurrent)?.total || 0;
        const curIncome = get('income', true);
        const curExpense = get('expense', true);
        const prevExpense = get('expense', false);

        const recommendations = [];
        const savingsRate = curIncome > 0 ? ((curIncome - curExpense) / curIncome) * 100 : 0;

        if (curIncome > 0) {
            if (savingsRate < 20) {
                recommendations.push({ type: 'warning', category: 'savings', title: 'Savings rate below 20%', message: `You saved ${savingsRate.toFixed(1)}% of income this month. Aim for at least 20%.`, suggestion: 'Try reducing discretionary spending (entertainment, shopping) by 15%.' });
            } else if (savingsRate > 40) {
                recommendations.push({ type: 'success', category: 'savings', title: 'Excellent savings discipline', message: `Great! You saved ${savingsRate.toFixed(1)}% of your income.`, suggestion: 'Consider investing surplus in mutual funds or SIPs for wealth growth.' });
            }
        }

        if (prevExpense > 0 && curExpense < prevExpense) {
            recommendations.push({ type: 'success', category: 'spending', title: 'Spending reduced', message: `You spent ${Math.round(((prevExpense - curExpense) / prevExpense) * 100)}% less than last month. Keep it up!`, suggestion: 'Redirect savings to a high-interest savings account or investment.' });
        }

        if (recommendations.length === 0) {
            recommendations.push({ type: 'info', category: 'general', title: 'Add more data', message: 'Add transactions and budgets to receive personalized recommendations.', suggestion: 'Start by adding this month\'s income and typical expenses.' });
        }
        res.json({ generatedAt: now, recommendations });
    } catch (err) { next(err); }
};