const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

exports.getSummary = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const result = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startOfMonth } } },
            { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);

        const income = result.find((r) => r._id === 'income')?.total || 0;
        const expense = result.find((r) => r._id === 'expense')?.total || 0;

        const allTime = await Transaction.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } },
        ]);
        const totalIncome = allTime.find((r) => r._id === 'income')?.total || 0;
        const totalExpense = allTime.find((r) => r._id === 'expense')?.total || 0;

        res.json({
            monthIncome: income, monthExpense: expense, monthBalance: income - expense,
            savings: income - expense,
            savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
            totalIncome, totalExpense, totalBalance: totalIncome - totalExpense,
        });
    } catch (err) { next(err); }
};

exports.getCategoryBreakdown = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const { startDate, endDate } = req.query;
        const match = { user: userId, type: 'expense' };
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate);
            if (endDate) match.date.$lte = new Date(endDate);
        }
        const data = await Transaction.aggregate([
            { $match: match },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' } } },
            { $sort: { total: -1 } },
        ]);
        const grandTotal = data.reduce((s, d) => s + d.total, 0);
        const enriched = data.map((d) => ({
            category: d._id, total: d.total, count: d.count,
            avg: Math.round(d.avg), percent: grandTotal ? Math.round((d.total / grandTotal) * 100) : 0,
        }));
        res.json({ total: grandTotal, breakdown: enriched });
    } catch (err) { next(err); }
};

exports.getMonthlyTrend = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const months = Number(req.query.months) || 6;
        const start = new Date();
        start.setMonth(start.getMonth() - (months - 1));
        start.setDate(1); start.setHours(0, 0, 0, 0);

        const data = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: start } } },
            { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const buckets = {};
        for (let i = 0; i < months; i++) {
            const d = new Date(); d.setMonth(d.getMonth() - (months - 1 - i));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets[key] = { month: key, income: 0, expense: 0, savings: 0 };
        }
        data.forEach((row) => {
            const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
            if (buckets[key]) buckets[key][row._id.type] = row.total;
        });
        res.json(Object.values(buckets).map((b) => ({ ...b, savings: b.income - b.expense })));
    } catch (err) { next(err); }
};

exports.getTopSpendingDays = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const data = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } }, { $limit: 5 },
        ]);
        res.json(data.map((d) => ({ date: d._id, total: d.total, count: d.count })));
    } catch (err) { next(err); }
};