const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dare = require('../models/Dare');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

dotenv.config({ path: './.env' });

const parseTimeframe = (timeframeStr) => {
    if (!timeframeStr) return 24 * 60 * 60 * 1000;
    const value = parseInt(timeframeStr);
    if (timeframeStr.includes('m')) return value * 60 * 1000; // minutes
    if (timeframeStr.includes('h')) return value * 60 * 60 * 1000; // hours
    if (timeframeStr.includes('d')) return value * 24 * 60 * 60 * 1000; // days
    return value * 60 * 1000; // default minutes
};

const cleanupExpiredDares = async () => {
    try {
        const activeDares = await Dare.find({ status: 'active' });
        console.log(`Found ${activeDares.length} active dares.`);
        let deletedCount = 0;
        const now = Date.now();

        for (const dare of activeDares) {
            const duration = parseTimeframe(dare.timeframe);
            const expirationTime = new Date(dare.createdAt).getTime() + duration;
            console.log(`Checking Dare: ${dare.title}, Timeframe: ${dare.timeframe}, Expires: ${new Date(expirationTime).toISOString()}, Now: ${new Date(now).toISOString()}`);

            if (now > expirationTime) {
                console.log(`EXPIRED: ${dare._id}`);
                // Refund
                const creator = await User.findById(dare.creator);
                if (creator) {
                    creator.walletBalance += dare.reward;
                    await creator.save();
                    console.log(`Refunded ${dare.reward} to ${creator.username}`);
                }
                await Dare.findByIdAndDelete(dare._id);
                console.log("Deleted Dare");
                deletedCount++;
            }
        }
        console.log(`Cleanup run complete. Deleted: ${deletedCount}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
};

const connectDB = async () => {
    try {
        console.log("Connecting to DB...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await cleanupExpiredDares();
        console.log("Exiting...");
        process.exit();
    } catch (error) {
        console.error("DB Connect Error:", error);
        process.exit(1);
    }
};

connectDB();
