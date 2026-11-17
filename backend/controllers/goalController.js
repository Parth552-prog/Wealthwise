const Goal = require('../models/Goal');

exports.createGoal = async (req, res, next) => {
    try {
        const goal = await Goal.create({ ...req.body, user: req.user._id });
        res.status(201).json(goal);
    } catch (err) { next(err); }
};

exports.getGoals = async (req, res, next) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) { next(err); }
};

exports.updateGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
        );
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        if (goal.savedAmount >= goal.targetAmount && goal.status === 'active') {
            goal.status = 'completed'; await goal.save();
        }
        res.json(goal);
    } catch (err) { next(err); }
};

exports.deleteGoal = async (req, res, next) => {
    try {
        const g = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!g) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (err) { next(err); }
};

exports.contributeToGoal = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        goal.savedAmount += Number(amount);
        if (goal.savedAmount >= goal.targetAmount) goal.status = 'completed';
        await goal.save();
        res.json(goal);
    } catch (err) { next(err); }
};