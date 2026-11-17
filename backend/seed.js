require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');

const seed = async () => {
    await connectDB();
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});

    const user = await User.create({
        name: 'Demo User',
        email: 'demo@wealthwise.com',
        password: 'password123',
        monthlyIncome: 75000,
        riskProfile: 'moderate',
    });

    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const txns = [];
    for (let i = 0; i < 6; i++) {
        const month = new Date(y, m - i, 1);
        txns.push(
            { user: user._id, type: 'income', amount: 75000, category: 'Salary', description: 'Monthly salary', date: new Date(month.getFullYear(), month.getMonth(), 1) },
            { user: user._id, type: 'expense', amount: 18000 + Math.random() * 4000, category: 'Rent', description: 'House rent', date: new Date(month.getFullYear(), month.getMonth(), 3) },
            { user: user._id, type: 'expense', amount: 6000 + Math.random() * 3000, category: 'Food', description: 'Groceries & dining', date: new Date(month.getFullYear(), month.getMonth(), 10) },
            { user: user._id, type: 'expense', amount: 2500 + Math.random() * 1500, category: 'Transport', description: 'Fuel & commute', date: new Date(month.getFullYear(), month.getMonth(), 15) },
            { user: user._id, type: 'expense', amount: 3000 + Math.random() * 4000, category: 'Entertainment', description: 'Movies & subscriptions', date: new Date(month.getFullYear(), month.getMonth(), 18) }
        );
    }
    await Transaction.insertMany(txns);

    await Budget.insertMany([
        { user: user._id, category: 'Food', limit: 8000, month: m + 1, year: y },
        { user: user._id, category: 'Rent', limit: 20000, month: m + 1, year: y },
        { user: user._id, category: 'Entertainment', limit: 4000, month: m + 1, year: y },
    ]);

    await Goal.insertMany([
        { user: user._id, title: 'Emergency Fund', targetAmount: 450000, savedAmount: 120000, deadline: new Date(y + 1, 11, 31), priority: 'high' },
        { user: user._id, title: 'Goa Trip', targetAmount: 60000, savedAmount: 25000, deadline: new Date(y, m + 3, 1), priority: 'medium' },
    ]);

    console.log('✅ Database seeded successfully');
    console.log('📧 Login: demo@wealthwise.com');
    console.log('🔑 Password: password123');
    await mongoose.connection.close();
    process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });