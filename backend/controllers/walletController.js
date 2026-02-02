const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get user wallet balance and transaction history
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            balance: user.walletBalance,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add funds (Simulation / Top-up)
// @route   POST /api/wallet/topup
// @access  Private
exports.topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update balance
        user.walletBalance += Number(amount);
        await user.save();

        // Create transaction record
        await Transaction.create({
            user: req.user.id,
            type: 'deposit',
            amount,
            status: 'completed',
            description: 'Wallet Top-up'
        });

        res.status(200).json({
            message: 'Top-up successful',
            balance: user.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Transfer coins to another user
// @route   POST /api/wallet/transfer
// @access  Private
exports.transferCoins = async (req, res) => {
    try {
        const { recipientUsername, amount } = req.body;
        const senderId = req.user.id;

        // Basic validation
        if (!recipientUsername || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid recipient or amount' });
        }

        // Check if sender has enough balance
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        if (sender.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Find recipient
        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        if (recipient._id.toString() === senderId.toString()) {
            return res.status(400).json({ message: 'Cannot transfer to yourself' });
        }

        // Perform Transfer (simulate transaction)
        // In a real app, use a MongoDB session/transaction for atomicity
        sender.walletBalance -= Number(amount);
        recipient.walletBalance += Number(amount);

        await sender.save();
        await recipient.save();

        // Create Transaction Records
        // 1. Sender Record (Withdrawal-like)
        await Transaction.create({
            user: senderId,
            type: 'withdrawal', // or custom type 'transfer_out'
            amount: -amount,
            status: 'completed',
            description: `Transfer to ${recipientUsername}`,
            relatedUser: recipient._id
        });

        // 2. Recipient Record (Deposit-like)
        await Transaction.create({
            user: recipient._id,
            type: 'deposit', // or custom type 'transfer_in'
            amount: amount,
            status: 'completed',
            description: `Received from ${sender.username}`,
            relatedUser: senderId
        });

        res.status(200).json({
            message: 'Transfer successful',
            balance: sender.walletBalance
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Transfer failed', error: error.message });
    }
};
