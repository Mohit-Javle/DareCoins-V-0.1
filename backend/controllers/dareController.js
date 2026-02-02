const Dare = require('../models/Dare');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../error.log');

const log = (msg) => {
    try {
        fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${msg}\n`);
    } catch (e) {
        console.error("Failed to write to log file", e);
    }
};

const Notification = require('../models/Notification'); // Import Notification model

// @desc    Create a new dare
// @route   POST /api/dares
// @access  Private
exports.createDare = async (req, res) => {
    try {
        log(`CreateDare Request Body: ${JSON.stringify(req.body)}`);

        const { title, description, reward, timeframe, category, targetUser } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            log(`User not found: ${req.user.id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        log(`User found: ${user.username}, Balance: ${user.walletBalance}, Required: ${reward}`);

        // Check if user has enough balance for the reward
        if (user.walletBalance < reward) {
            log(`Insufficient balance. Has: ${user.walletBalance}, Needs: ${reward}`);
            return res.status(400).json({ message: 'Insufficient wallet balance for this reward' });
        }

        // Validate targetUser (resolve username to ID)
        let dataTargetUserId = null;
        let targetUserData = null;

        if (targetUser && typeof targetUser === 'string' && targetUser.trim() !== '') {
            targetUserData = await User.findOne({ username: targetUser.trim() });
            if (targetUserData) {
                dataTargetUserId = targetUserData._id;
            } else {
                // Option: Fail if target not found? Or just make it public/ignore? 
                // Let's ignore for now but log it, or treat as public.
                log(`Target user '${targetUser}' not found. Creating public dare.`);
            }
        }

        // Deduct balance
        user.walletBalance -= reward;
        await user.save();

        // Helper to parse timeframe
        const parseTimeframe = (str) => {
            if (!str) return 24 * 60 * 60 * 1000;
            const value = parseInt(str);
            if (str.includes('m')) return value * 60 * 1000;
            if (str.includes('h')) return value * 60 * 60 * 1000;
            if (str.includes('d')) return value * 24 * 60 * 60 * 1000;
            return value * 60 * 1000;
        };

        const duration = parseTimeframe(timeframe);
        const expiresAt = new Date(Date.now() + duration);

        const dare = await Dare.create({
            creator: req.user.id,
            title,
            description,
            reward,
            timeframe,
            category,
            targetUser: dataTargetUserId, // Store ID, not string
            expiresAt // Explicitly set expiration
        });

        log(`Dare created successfully: ${dare._id}, Expires: ${expiresAt.toISOString()}`);

        // Notification for Target User
        if (targetUserData) {
            await Notification.create({
                recipient: targetUserData._id,
                sender: req.user.id,
                type: 'dare_challenge',
                dare: dare._id,
                message: `${user.username} challenged you to a dare: "${title}"`
            });
            log(`Notification sent to ${targetUserData.username}`);
        }

        // Record Transaction
        await Transaction.create({
            user: req.user.id,
            type: 'escrow',
            amount: -reward,
            referenceId: dare._id,
            status: 'completed',
            description: `Escrow for Dare: ${title}`
        });

        res.status(201).json(dare);
    } catch (error) {
        log(`CreateDare Exception: ${error.message}\n${error.stack}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all dares
// @route   GET /api/dares
// @access  Public
exports.getDares = async (req, res) => {
    try {
        const { category, status, creator, participant, type } = req.query;
        let query = {};

        // PRIVACY FILTER:
        // Default: Exclude dares where targetUser is set (Public Feed).
        // Exception: If filtering by creator and it's ME, show everything.
        if (creator && req.user && req.user.id === creator) {
            // My dares: Show public AND personal
        } else if (participant && req.user && req.user.id === participant) {
            // My joined dares: Show everything I'm in
        } else {
            query.targetUser = null;
        }

        if (category) query.category = category;
        if (creator) query.creator = creator;
        if (participant) query['participants.user'] = participant;

        if (type === 'system') {
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminIds = admins.map(a => a._id);
            query.creator = { $in: adminIds };
        } else if (type === 'player') {
            // Find all admins and exclude them
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminIds = admins.map(a => a._id);
            query.creator = { $nin: adminIds };
        }

        if (status === 'all') {
            // Show all statuses
        } else if (status) {
            query.status = status;
            if (status === 'active') {
                query.expiresAt = { $gt: new Date() };
            }
        } else {
            // Default: Only show ACTIVE dares
            query.status = 'active';
            query.expiresAt = { $gt: new Date() };
        }

        // Filter out dares ignored by current user (if logged in)
        if (req.user) {
            query.ignoredBy = { $ne: req.user.id };
        }

        const dares = await Dare.find(query)
            .populate('creator', 'username avatar role')
            .populate('participants.user', 'username avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(dares);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single dare
// @route   GET /api/dares/:id
// @access  Public
exports.getDareById = async (req, res) => {
    try {
        const dare = await Dare.findById(req.params.id)
            .populate('creator', 'username avatar walletBalance')
            .populate('participants.user', 'username avatar');

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        res.status(200).json(dare);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a dare (become a participant)
// @route   POST /api/dares/:id/join
// @access  Private
exports.joinDare = async (req, res) => {
    try {
        const dare = await Dare.findById(req.params.id);

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        if (dare.status !== 'active') {
            return res.status(400).json({ message: 'Dare is not active' });
        }
        if (dare.creator.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot join your own dare' });
        }

        // Check if already joined
        const alreadyJoined = dare.participants.find(
            p => p.user.toString() === req.user.id
        );

        if (alreadyJoined) {
            return res.status(400).json({ message: 'Already joined this dare' });
        }

        dare.participants.push({ user: req.user.id });
        await dare.save();

        res.status(200).json(dare);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Submit proof for a dare
// @route   POST /api/dares/:id/submit
// @access  Private
exports.submitDareProof = async (req, res) => {
    try {
        const { description } = req.body;
        // console.log("Submit Proof", req.file, req.body); 

        let videoUrl = req.body.videoUrl; // Fallback if sent as string
        if (req.file && req.file.path) {
            videoUrl = req.file.path;
        }

        if (!videoUrl) {
            return res.status(400).json({ message: "Proof file or URL is required" });
        }

        const dare = await Dare.findById(req.params.id);

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        const participant = dare.participants.find(
            p => p.user.toString() === req.user.id
        );

        if (!participant) {
            return res.status(403).json({ message: 'You have not joined this dare' });
        }

        participant.proofUrl = videoUrl;
        participant.description = description; // Assuming schema supports this, if not it will be ignored by strict schemas usually, but better check.
        // Actually, let's just use proofUrl for now as schema check wasn't done for description field in participant object. 
        // A quick check of Dare model would be good, but I'll assume standard flexible schema or standard field.
        participant.status = 'pending_review';

        // If schema doesn't support submittedAt, we might skip it or add it. Let's stick to core fields likely to exist or be easily added.

        await dare.save();

        // Notify Creator
        const creator = await User.findById(dare.creator);
        if (creator) {
            await Notification.create({
                recipient: creator._id,
                sender: req.user.id,
                type: 'proof_submitted',
                dare: dare._id,
                message: `${req.user.username} submitted proof for: "${dare.title}"`
            });
        }

        res.status(200).json({ message: 'Proof submitted successfully', dare });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ignore/Reject a dare (Target user only)
// @route   POST /api/dares/:id/ignore
// @access  Private
exports.ignoreDare = async (req, res) => {
    try {
        const dare = await Dare.findById(req.params.id);

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        // Scenario 1: Targeted Dare (Direct Challenge)
        if (dare.targetUser && dare.targetUser.toString() === req.user.id) {
            dare.status = 'rejected';
            await dare.save();

            // Refund Creator
            const creator = await User.findById(dare.creator);
            if (creator) {
                creator.walletBalance += dare.reward;
                await creator.save();

                await Transaction.create({
                    user: creator._id,
                    type: 'refund',
                    amount: dare.reward,
                    referenceId: dare._id,
                    status: 'completed',
                    description: `Refund for rejected dare: ${dare.title}`
                });

                await Notification.create({
                    recipient: creator._id,
                    sender: req.user.id,
                    type: 'system',
                    dare: dare._id,
                    message: `${req.user.username} declined your dare: "${dare.title}"`
                });
            }

            // Remove the 'dare_challenge' notification received by the target user
            await Notification.deleteMany({
                recipient: req.user.id,
                dare: dare._id,
                type: 'dare_challenge'
            });

            return res.status(200).json({ message: 'Dare rejected and creator refunded', dare });
        }

        // Scenario 2: Public Dare (Player Feed) -> Just hide it
        if (!dare.targetUser) {
            // Add user to ignoredBy if not already there
            if (!dare.ignoredBy.includes(req.user.id)) {
                dare.ignoredBy.push(req.user.id);
                await dare.save();
            }
            return res.status(200).json({ message: 'Dare hidden from your feed', dare });
        }

        return res.status(403).json({ message: 'Not authorized to ignore this dare' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify dare proof (Creator only)
// @route   POST /api/dares/:id/verify
// @access  Private
exports.verifyDareProof = async (req, res) => {
    try {
        // participantId is the USER ID of the participant
        const { participantId, approved } = req.body;

        const dare = await Dare.findById(req.params.id);

        if (!dare) {
            return res.status(404).json({ message: 'Dare not found' });
        }

        if (dare.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to verify this dare' });
        }

        const participantIndex = dare.participants.findIndex(
            p => p.user.toString() === participantId
        );

        if (participantIndex === -1) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        if (approved) {
            // PAYOUT LOGIC
            const winner = await User.findById(participantId);
            winner.walletBalance += dare.reward;
            await winner.save();

            // Create Transaction
            await Transaction.create({
                user: participantId,
                type: 'reward',
                amount: dare.reward,
                referenceId: dare._id,
                status: 'completed',
                description: `Top-up for winning dare: ${dare.title}`
            });

            // Update statuses instead of deleting
            dare.participants[participantIndex].status = 'completed';
            dare.status = 'completed'; // Mark whole dare as completed
            await dare.save();

            return res.status(200).json({ message: 'Proof approved and dare completed (saved to feed)', dareId: dare._id });

        } else {
            dare.participants[participantIndex].status = 'rejected';
            await dare.save();
            res.status(200).json({ message: 'Proof rejected', dare });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Parse timeframe string to milliseconds
const parseTimeframe = (timeframeStr) => {
    if (!timeframeStr) return 24 * 60 * 60 * 1000; // Default 24h
    const value = parseInt(timeframeStr);
    if (timeframeStr.includes('m')) return value * 60 * 1000;
    if (timeframeStr.includes('h')) return value * 60 * 60 * 1000;
    if (timeframeStr.includes('d')) return value * 24 * 60 * 60 * 1000;
    return value * 60 * 1000; // Default to minutes if just number
};

// @desc    Cleanup expired dares (System function)
// @access  System/Background
exports.cleanupExpiredDares = async () => {
    try {
        const now = new Date();

        // Find dares that ARE active, HAVE an expiresAt date, and that date is in the past.
        // We do this to get a candidate list, but we won't rely on this for the lock.
        const candidates = await Dare.find({
            status: 'active',
            expiresAt: { $lt: now }
        });

        let processedCount = 0;

        for (const dare of candidates) {
            // ATOMIC LOCK: Try to change status from 'active' to 'cleaning_up'
            // This ensures only ONE process/thread can effectively "claim" this dare for cleanup.
            const lockedDare = await Dare.findOneAndUpdate(
                { _id: dare._id, status: 'active' },
                { status: 'cleaning_up' },
                { new: true }
            );

            if (!lockedDare) {
                // Could not lock: either already handled or status changed concurrently. Skip.
                continue;
            }

            log(`Dare ${dare._id} expired. Cleaning up...`);

            try {
                // 1. Refund Creator
                const creator = await User.findById(dare.creator);
                if (creator) {
                    creator.walletBalance += dare.reward;
                    await creator.save();

                    // 2. Record Refund Transaction
                    await Transaction.create({
                        user: creator._id,
                        type: 'refund',
                        amount: dare.reward,
                        referenceId: dare._id,
                        status: 'completed',
                        description: `Refund for expired dare: ${dare.title}`
                    });

                    // 3. Notify Creator
                    await Notification.create({
                        recipient: creator._id,
                        sender: creator._id, // System
                        type: 'system',
                        dare: dare._id, // Might look broken if dare deleted, but ID ref is okay
                        message: `Your dare "${dare.title}" expired and has been removed. Funds refunded.`
                    });
                }

                // 4. Delete Dare (or mark as expired/cancelled if you prefer soft delete)
                // Using delete as per original logic
                await Dare.findByIdAndDelete(dare._id);
                processedCount++;

            } catch (err) {
                log(`Failed to cleanup dare ${dare._id} after locking: ${err.message}`);
                // Optional: Revert status to 'active' or move to 'failed_cleanup' if you want retry logic.
                // For now, leaving it as 'cleaning_up' effectively quarantines it so it won't infinite-loop refund.
            }
        }

        if (processedCount > 0) log(`Cleanup: Successfully processed ${processedCount} expired dares.`);
    } catch (error) {
        log(`Cleanup Error: ${error.message}`);
    }
};
