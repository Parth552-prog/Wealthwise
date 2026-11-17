const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res, next) => {
    try {
        const txn = await Transaction.create({ ...req.body, user: req.user._id });
        res.status(201).json(txn);
    } catch (err) { next(err); }
};

exports.getTransactions = async (req, res, next) => {
    try {
        const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [transactions, total] = await Promise.all([
            Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
            Transaction.countDocuments(filter),
        ]);
        res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
};

exports.updateTransaction = async (req, res, next) => {
    try {
        const txn = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body, { new: true, runValidators: true }
        );
        if (!txn) return res.status(404).json({ message: 'Transaction not found' });
        res.json(txn);
    } catch (err) { next(err); }
};

exports.deleteTransaction = async (req, res, next) => {
    try {
        const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!txn) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted', id: txn._id });
    } catch (err) { next(err); }
};