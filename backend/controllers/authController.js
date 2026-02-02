const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Helper: Calculate Rank based on Wallet Balance
const calculateRank = async (userId, userBalance) => {
    try {
        // Count how many users have more money than this user
        // If balance is equal, tie-breaking by createdAt (older accounts get better rank) could be added,
        // but for now simple > check.
        const higherBalanceCount = await User.countDocuments({
            walletBalance: { $gt: userBalance }
        });
        return higherBalanceCount + 1;
    } catch (error) {
        console.error("Error calculating rank:", error);
        return 0; // Fallback
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            // New user usually has default balance, rank likely last or near last
            const rank = await calculateRank(user.id, user.walletBalance);

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                walletBalance: user.walletBalance,
                highlights: user.highlights, // Empty on register, but consistent
                rank: rank,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user by email or username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Populate highlights
            await user.populate('highlights');

            const rank = await calculateRank(user.id, user.walletBalance);

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                walletBalance: user.walletBalance,
                highlights: user.highlights,
                rank: rank,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    // Populate highlights
    if (req.user && req.user.highlights.length > 0) {
        await req.user.populate('highlights');
    }

    // Calculate rank for /me as well to keep it fresh
    const rank = await calculateRank(req.user.id, req.user.walletBalance);

    // Convert mongoose doc to object to append rank
    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    userObj.rank = rank;

    res.status(200).json(userObj);
};

// @desc    Update user details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserDetails = async (req, res) => {
    console.log("updateUserDetails hit.");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.username = req.body.username || user.username;
            // user.email = req.body.email || user.email; // Don't update email from profile for now to avoid lockout
            user.bio = req.body.bio || user.bio;
            user.favVideo = req.body.favVideo || user.favVideo;

            // Update from Body (URL support)
            // Ensure we only accept strings (prevents empty objects {} from breaking Mongoose)
            if (req.body.avatar && typeof req.body.avatar === 'string') user.avatar = req.body.avatar;
            if (req.body.banner && typeof req.body.banner === 'string') user.banner = req.body.banner;

            // Update from Files (Upload support) - Overwrites body if present
            if (req.files) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                if (req.files.avatar && req.files.avatar.length > 0) {
                    user.avatar = `${baseUrl}/uploads/${req.files.avatar[0].filename}`;
                }
                if (req.files.banner && req.files.banner.length > 0) {
                    user.banner = `${baseUrl}/uploads/${req.files.banner[0].filename}`;
                }
            }

            const updatedUser = await user.save();
            await updatedUser.populate('highlights');

            const rank = await calculateRank(updatedUser.id, updatedUser.walletBalance);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                walletBalance: updatedUser.walletBalance, // Keep wallet balance
                bio: updatedUser.bio, // Return bio
                favVideo: updatedUser.favVideo, // Return favVideo
                banner: updatedUser.banner, // Return banner
                highlights: updatedUser.highlights, // Return populated highlights
                rank: rank,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update highlights
// @route   PUT /api/auth/highlights
// @access  Private
exports.updateHighlights = async (req, res) => {
    try {
        const { dareId, action } = req.body; // action: 'add' or 'remove'
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (action === 'add') {
            if (!user.highlights.includes(dareId)) {
                user.highlights.push(dareId);
            }
        } else if (action === 'remove') {
            user.highlights = user.highlights.filter(id => id.toString() !== dareId);
        }

        await user.save();
        // Populate highlights to return full objects
        await user.populate('highlights');

        res.json(user.highlights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
