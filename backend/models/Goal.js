const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        targetAmount: { type: Number, required: true, min: 1 },
        savedAmount: { type: Number, default: 0, min: 0 },
        deadline: { type: Date, required: true },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
    },
    { timestamps: true }
);

goalSchema.virtual('progressPercent').get(function () {
    if (this.targetAmount === 0) return 0;
    return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);