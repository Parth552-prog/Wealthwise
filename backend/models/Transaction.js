const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than zero'],
        },
        category: {
            type: String,
            required: true,
            enum: [
                'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income',
                'Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Healthcare',
                'Shopping', 'Education', 'Travel', 'Insurance', 'Other Expense',
            ],
        },
        description: { type: String, trim: true, default: '' },
        date: { type: Date, required: true, default: Date.now },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi', 'netbanking', 'other'],
            default: 'upi',
        },
    },
    { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);