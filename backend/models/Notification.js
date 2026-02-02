const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['dare_challenge', 'proof_submitted', 'dare_verified', 'system', 'truth_answer'],
        required: true
    },
    dare: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dare'
    },
    truth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truth'
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
