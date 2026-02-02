const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: 'https://i.pravatar.cc/150?u=0'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    walletBalance: {
        type: Number,
        default: 500 // Initial bonus
    },
    bio: {
        type: String,
        default: '',
        maxlength: 250
    },
    favVideo: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    highlights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dare'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
