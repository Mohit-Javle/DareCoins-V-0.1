const mongoose = require('mongoose');

const truthSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    category: {
        type: String,
        enum: ['Personal', 'Funny', 'Deep', 'Random', 'Dirty'], // Adapted for Truth context
        default: 'Random'
    },
    difficulty: {
        type: String,
        enum: ['Level 1', 'Level 2', 'Level 3'],
        default: 'Level 1'
    },
    reward: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        answer: String, // Text answer
        videoUrl: String, // Optional video answer
        status: {
            type: String,
            enum: ['pending_review', 'completed', 'rejected'],
            default: 'pending_review'
        },
        answeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Truth', truthSchema);
