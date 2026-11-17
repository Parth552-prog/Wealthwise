const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.createBudget = async (req, res, next) => {
    try {
        const { category, limit, month, year } = req.body;
        const existing = await Budget.findOne({ user: req.user._id, category, month, year });
        if (existing) return res.status(400).json({ message: 'Budget already exists' });
        const budget = await Budget.create({ user: req.user._id, category, limit, month, year });
        res.status(201).json(budget);
    } catch (err) { next(err); }
};

exports.getBudgets = async (req, res, next) => {
    try {
        const now = new Date();
        const month = Number(req.query.month) || now.getMonth() + 1;
        const year = Number(req.query.year) || now.getFullYear();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const spending = await Transaction.aggregate([
            { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lt: end } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
        ]);
        const spentMap = spending.reduce((acc, s) => { acc[s._id] = s.total; return acc; }, {});
        const budgets = await Budget.find({ user: req.user._id, month, year }).lean();

        const enriched = budgets.map((b) => ({
            ...b,
            spent: spentMap[b.category] || 0,
            remaining: b.limit - (spentMap[b.category] || 0),
            percentUsed: Math.round(((spentMap[b.category] || 0) / b.limit) * 100),
        }));
        res.json({ month, year, budgets: enriched });
    } catch (err) { next(err); }
};

exports.updateBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
        );
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json(budget);
    } catch (err) { next(err); }
};

exports.deleteBudget = async (req, res, next) => {
    try {
        const b = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!b) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (err) { next(err); }
};