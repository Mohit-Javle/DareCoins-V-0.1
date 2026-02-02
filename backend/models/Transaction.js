const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'reward', 'fee', 'dare_stake', 'escrow', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId, // Could link to a Dare or external payment ID
        ref: 'Dare'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
