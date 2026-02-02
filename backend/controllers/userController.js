const User = require('../models/User');
const Dare = require('../models/Dare');
const Truth = require('../models/Truth');

// @desc    Get user profile with their content (Dares & Truths)
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user's Dares
        const dares = await Dare.find({ creator: user._id })
            .sort({ createdAt: -1 });

        // Fetch user's Truths
        const truths = await Truth.find({ creator: user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            user,
            dares,
            truths,
            totalDares: dares.length,
            totalTruths: truths.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Leaderboard (Top 50 by Wallet Balance)
// @route   GET /api/users/leaderboard
// @access  Public
// @desc    Get Leaderboard (Multi-category)
// @route   GET /api/users/leaderboard?category=coins|completed|creator|truth
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const category = req.query.category || 'coins';
        let leaderboard = [];

        if (category === 'coins') {
            // Default: Richest Users (Excluding Admins)
            leaderboard = await User.find({ role: { $ne: 'admin' } })
                .sort({ walletBalance: -1 })
                .limit(50)
                .select('name username avatar walletBalance rule');

            // Map to standard format
            leaderboard = leaderboard.map(u => ({
                _id: u._id,
                name: u.name,
                username: u.username,
                avatar: u.avatar,
                score: u.walletBalance,
                metric: 'DRC'
            }));

        } else if (category === 'completed') {
            // Most Dares Completed
            const results = await Dare.aggregate([
                { $unwind: "$participants" },
                { $match: { "participants.status": { $in: ["completed", "verified"] } } },
                { $group: { _id: "$participants.user", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 50 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $match: { "user.role": { $ne: 'admin' } } } // Filter out admins
            ]);

            leaderboard = results.map(item => ({
                _id: item.user._id,
                name: item.user.name,
                username: item.user.username,
                avatar: item.user.avatar,
                score: item.count,
                metric: 'Dares'
            }));

        } else if (category === 'creator') {
            // Most Dares Created (Dare Givers)
            const results = await Dare.aggregate([
                { $group: { _id: "$creator", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 50 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $match: { "user.role": { $ne: 'admin' } } } // Filter out admins
            ]);

            leaderboard = results.map(item => ({
                _id: item.user._id,
                name: item.user.name,
                username: item.user.username,
                avatar: item.user.avatar,
                score: item.count,
                metric: 'Created'
            }));

        } else if (category === 'truth') {
            // Most Truths Answered (Truth Seekers)
            const results = await Truth.aggregate([
                { $unwind: "$participants" },
                { $group: { _id: "$participants.user", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 50 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $match: { "user.role": { $ne: 'admin' } } } // Filter out admins
            ]);

            leaderboard = results.map(item => ({
                _id: item.user._id,
                name: item.user.name,
                username: item.user.username,
                avatar: item.user.avatar,
                score: item.count,
                metric: 'Truths'
            }));
        }

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
