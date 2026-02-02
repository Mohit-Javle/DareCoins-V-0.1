const Truth = require('../models/Truth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Create a new truth
// @route   POST /api/truths
// @access  Private
exports.createTruth = async (req, res) => {
    try {
        const { question, category, difficulty, targetUser, reward = 0 } = req.body;
        console.log("Creating Truth:", req.body, "User:", req.user.id);

        if (reward > 500) {
            return res.status(400).json({ message: 'Max reward for Truth is 500 DRC' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.walletBalance < reward) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Deduct balance
        if (reward > 0) {
            user.walletBalance -= reward;
            await user.save();
        }

        const truthPayload = {
            creator: req.user.id,
            question,
            category,
            difficulty,
            reward
        };

        if (targetUser) {
            truthPayload.targetUser = targetUser;
        }

        const truth = await Truth.create(truthPayload);

        // Record Transaction
        if (reward > 0) {
            await Transaction.create({
                user: req.user.id,
                type: 'escrow',
                amount: -reward,
                referenceId: truth._id,
                status: 'completed',
                description: `Escrow for Truth: ${question.substring(0, 20)}...`
            });
        }

        res.status(201).json(truth);
    } catch (error) {
        console.error("Create Truth Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all truths
// @route   GET /api/truths
// @access  Public
exports.getTruths = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type === 'system') {
            const User = require('../models/User'); // Import dynamically to avoid circular issues or just standard require
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminIds = admins.map(a => a._id);
            query.creator = { $in: adminIds };
        } else if (type === 'player') {
            const User = require('../models/User');
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminIds = admins.map(a => a._id);
            query.creator = { $nin: adminIds };
        }

        if (req.query.creator) {
            query.creator = req.query.creator;
        }

        const truths = await Truth.find(query)
            .populate('creator', 'username avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(truths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Answer a truth
// @route   POST /api/truths/:id/answer
// @access  Private
exports.answerTruth = async (req, res) => {
    try {
        const { answer } = req.body;
        let videoUrl = req.body.videoUrl;

        if (req.file && req.file.path) {
            videoUrl = req.file.path;
        }
        const truth = await Truth.findById(req.params.id);

        if (!truth) {
            return res.status(404).json({ message: 'Truth not found' });
        }

        const newAnswer = {
            user: req.user.id,
            answer,
            videoUrl,
            status: 'pending_review'
        };

        const Notification = require('../models/Notification'); // Import dynamically or at top

        truth.participants.push(newAnswer);
        await truth.save();

        // Notify Creator
        if (truth.creator.toString() !== req.user.id) {
            await Notification.create({
                recipient: truth.creator,
                sender: req.user.id,
                type: 'truth_answer', // Using existing type for simplicity, or create 'truth_answer'
                truth: truth._id,
                message: `${req.user.username} answered your truth: "${truth.question.substring(0, 30)}..."`
            });
        }

        res.status(200).json(truth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/Approve a truth answer
// @route   POST /api/truths/:id/verify
// @access  Private
exports.verifyTruth = async (req, res) => {
    try {
        const { participantId, approved } = req.body;
        const truth = await Truth.findById(req.params.id);

        if (!truth) {
            return res.status(404).json({ message: 'Truth not found' });
        }

        if (truth.creator.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Find participant by USER ID (since frontend sends user ID for consistency with Dares)
        const participant = truth.participants.find(p => p.user.toString() === participantId);

        if (!participant) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        participant.status = approved ? 'completed' : 'rejected';
        await truth.save();

        if (approved && truth.reward > 0) {
            const winner = await User.findById(participant.user);
            if (winner) {
                winner.walletBalance += truth.reward;
                await winner.save();

                await Transaction.create({
                    user: winner._id,
                    type: 'reward',
                    amount: truth.reward,
                    referenceId: truth._id,
                    status: 'completed',
                    description: `Reward for answering Truth: ${truth.question.substring(0, 20)}...`
                });
            }
        }

        res.status(200).json(truth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
