const Dare = require('../models/Dare');
const Truth = require('../models/Truth');

// @desc    Get unified feed of Dares and Truths
// @route   GET /api/content/feed
// @access  Public
exports.getContentFeed = async (req, res) => {
    try {
        // 1. Fetch Dares
        const dares = await Dare.find({ status: 'active' })
            .populate('creator', 'username avatar')
            .lean(); // Use lean() to return plain JS objects so we can modify them

        // 2. Fetch Truths
        const truths = await Truth.find()
            .populate('creator', 'username avatar')
            .lean();

        // 3. Label/Tag them for frontend differentiation
        const taggedDares = dares.map(d => ({ ...d, type: 'dare' }));
        const taggedTruths = truths.map(t => ({ ...t, type: 'truth' }));

        // 4. Combine
        const allContent = [...taggedDares, ...taggedTruths];

        // 5. Sort by creation date (newest first)
        allContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(allContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get feed of approved/completed proofs (TikTok style)
// @route   GET /api/content/proofs
// @access  Public
exports.getApprovedProofs = async (req, res) => {
    try {
        // Find dares where at least one participant has status 'completed' AND targetUser is null (Public)
        // We want to return a list of "Proof Items"
        const dares = await Dare.find({ 'participants.status': 'completed', targetUser: null })
            .populate('creator', 'username avatar')
            .populate('participants.user', 'username avatar') // Populate participant details
            .lean();

        let proofs = [];

        dares.forEach(dare => {
            // Filter only completed participants
            const completedParticipants = dare.participants.filter(p => p.status === 'completed');

            completedParticipants.forEach(p => {
                proofs.push({
                    id: `${dare._id}-${p.user._id}`, // Unique composite ID
                    dareId: dare._id,
                    type: 'video', // Assuming all proofs are video/image for now
                    url: p.proofUrl, // The video/image URL
                    title: dare.title,
                    user: p.user ? p.user.username : 'Unknown',
                    userAvatar: p.user ? p.user.avatar : null,
                    creator: dare.creator.username,
                    likes: 0, // Placeholder
                    views: '1K', // Placeholder
                    description: p.description || dare.title,
                    createdAt: p.joinedAt // Using joinedAt as proxy for submission time if submittedAt missing
                });
            });
        });

        // Fetch Truths with completed answers AND targetUser is null (Public)
        const truths = await Truth.find({ 'participants.status': 'completed', targetUser: null })
            .populate('creator', 'username avatar')
            .populate('participants.user', 'username avatar')
            .lean();

        truths.forEach(truth => {
            const completedParticipants = truth.participants.filter(p => p.status === 'completed');
            completedParticipants.forEach(p => {
                proofs.push({
                    id: `${truth._id}-${p.user._id}`,
                    dareId: truth._id, // Keep consistent prop name or use 'contentId'
                    type: 'truth',
                    question: truth.question,
                    answer: p.answer,
                    user: p.user ? p.user.username : 'Unknown',
                    userAvatar: p.user ? p.user.avatar : null,
                    creator: truth.creator.username,
                    likes: 0,
                    views: '1K',
                    description: truth.category || 'Truth',
                    createdAt: p.answeredAt || p.joinedAt || new Date()
                });
            });
        });

        // Sort by newest first (using joinedAt/createdAt proxy)
        proofs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(proofs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
