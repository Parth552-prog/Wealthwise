const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        category: { type: String, required: true },
        limit: { type: Number, required: true, min: 1 },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
        spent: { type: Number, default: 0 },
    },
    { timestamps: true }
);

budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);