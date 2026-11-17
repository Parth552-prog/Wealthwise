const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, monthlyIncome } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, monthlyIncome });
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email,
            monthlyIncome: user.monthlyIncome, currency: user.currency,
            riskProfile: user.riskProfile, token: generateToken(user._id),
        });
    } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.json({
            _id: user._id, name: user.name, email: user.email,
            monthlyIncome: user.monthlyIncome, currency: user.currency,
            riskProfile: user.riskProfile, token: generateToken(user._id),
        });
    } catch (err) { next(err); }
};

exports.getMe = async (req, res) => res.json(req.user);

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, monthlyIncome, currency, riskProfile } = req.body;
        const user = await User.findById(req.user._id);
        if (name) user.name = name;
        if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;
        if (currency) user.currency = currency;
        if (riskProfile) user.riskProfile = riskProfile;
        await user.save();
        res.json(user);
    } catch (err) { next(err); }
};