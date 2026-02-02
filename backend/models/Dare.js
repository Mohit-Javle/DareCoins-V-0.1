const mongoose = require('mongoose');

const dareSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null means public (anyone can join)
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    reward: {
        type: Number,
        required: true,
        min: 0
    },
    timeframe: {
        type: String, // e.g., "24h", "2h 30m" - could be parsed to Date later
        required: true
    },
    category: {
        type: String,
        enum: ['Physical', 'Social', 'Creative', 'Funny', 'Other', 'Fitness', 'Extreme', 'Crypto', 'Personal', 'Deep', 'Dirty', 'Random'], // Expanded for new UI options
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled', 'cleaning_up', 'rejected'],
        default: 'active'
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        proofUrl: String,
        joinedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected', 'pending_review', 'completed'],
            default: 'pending'
        }
    }],
    ignoredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        index: true // Add index for performance since we'll query this often
    }
});

// Pre-save middleware to calculate expiresAt if not set (for legacy or direct saves)
// Pre-save middleware to calculate expiresAt if not set (for legacy or direct saves)
dareSchema.pre('save', async function () { // async function, no next needed
    if (!this.expiresAt && this.timeframe) {
        // Simple parser fallback if not set by controller
        const parseTimeframe = (str) => {
            const value = parseInt(str);
            if (str.includes('m')) return value * 60 * 1000;
            if (str.includes('h')) return value * 60 * 60 * 1000;
            if (str.includes('d')) return value * 24 * 60 * 60 * 1000;
            return value * 60 * 1000;
        };
        this.expiresAt = new Date(this.createdAt.getTime() + parseTimeframe(this.timeframe));
    }
});

module.exports = mongoose.model('Dare', dareSchema);
