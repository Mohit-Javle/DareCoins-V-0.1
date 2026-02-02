const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE'
});

exports.createOrder = async (req, res) => {
    try {
        const { amount, packId } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                packId: packId || 'custom'
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({ message: 'Something went wrong creating the order', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, drcAmount } = req.body;
        const userId = req.user.id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const creditAmount = Number(drcAmount) || 0;
            user.walletBalance += creditAmount;
            await user.save();

            await Transaction.create({
                user: userId,
                type: 'deposit',
                amount: creditAmount,
                description: `Top-up: purchased ${creditAmount} DRC`,
                status: 'completed',
                metadata: {
                    razorpay_order_id,
                    razorpay_payment_id,
                    inr_amount: amount
                }
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified and wallet updated',
                newBalance: user.walletBalance
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

    } catch (error) {
        console.error('Razorpay Verify Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.mockPayment = async (req, res) => {
    try {
        const { amount, packId, drcAmount } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const creditAmount = Number(drcAmount) || 0;
        user.walletBalance += creditAmount;
        await user.save();

        await Transaction.create({
            user: userId,
            type: 'deposit',
            amount: creditAmount,
            description: `Top-up: purchased ${creditAmount} DRC (Mock)`,
            status: 'completed',
            metadata: {
                payment_method: 'mock_gateway',
                inr_amount: amount,
                pack_id: packId
            }
        });

        res.status(200).json({
            success: true,
            message: 'Mock payment successful',
            newBalance: user.walletBalance
        });

    } catch (error) {
        console.error('Mock Payment Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
