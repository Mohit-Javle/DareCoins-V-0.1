const User = require('../models/User');
const Dare = require('../models/Dare');
const Truth = require('../models/Truth');
const Transaction = require('../models/Transaction');

// @desc    Get Admin Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeDares = await Dare.countDocuments({ status: 'active' });
        const totalVolume = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            totalUsers,
            activeDares,
            totalVolume: totalVolume[0] ? Math.abs(totalVolume[0].total) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Role or Ban
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { role, isBanned } = req.body; // Can extend schema later for isBanned
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        // if (isBanned !== undefined) user.isBanned = isBanned; // Need schema update for this

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Dares (Admin)
// @route   GET /api/admin/dares
// @access  Private/Admin
exports.getAllDares = async (req, res) => {
    try {
        const dares = await Dare.find({})
            .populate('creator', 'name username email role')
            .sort({ createdAt: -1 });
        res.status(200).json(dares);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Dare
// @route   DELETE /api/admin/dares/:id
// @access  Private/Admin
exports.deleteDare = async (req, res) => {
    try {
        const dare = await Dare.findById(req.params.id);

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        await dare.deleteOne();
        res.status(200).json({ message: 'Dare removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Truths (Admin)
// @route   GET /api/admin/truths
// @access  Private/Admin
exports.getAllTruths = async (req, res) => {
    try {
        const truths = await Truth.find({})
            .populate('creator', 'name username email role')
            .sort({ createdAt: -1 });
        res.status(200).json(truths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Truth
// @route   DELETE /api/admin/truths/:id
// @access  Private/Admin
exports.deleteTruth = async (req, res) => {
    try {
        const truth = await Truth.findById(req.params.id);

        if (!truth) {
            return res.status(404).json({ message: 'Truth not found' });
        }

        await truth.deleteOne();
        res.status(200).json({ message: 'Truth removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Analytics Data (User Growth & Volume)
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalyticsData = async (req, res) => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        // User Growth (Group by Date)
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transaction Volume (Group by Date)
        const transactionVolume = await Transaction.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: { $abs: "$amount" } } // Absolute volume
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ userGrowth, transactionVolume });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
