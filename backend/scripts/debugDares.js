const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dare = require('../models/Dare');

dotenv.config({ path: './.env' });

const debugDares = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const dares = await Dare.find({});
        console.log(`Found ${dares.length} dares in total.\n`);

        const now = Date.now();

        dares.forEach(d => {
            const duration = parseTimeframe(d.timeframe);
            const expiresAt = new Date(d.createdAt).getTime() + duration;
            const isExpired = now > expiresAt;

            console.log(`ID: ${d._id}`);
            console.log(`Title: ${d.title}`);
            console.log(`Status: ${d.status}`);
            console.log(`Created: ${d.createdAt}`);
            console.log(`Timeframe: ${d.timeframe} -> ${duration}ms`);
            console.log(`Expires At: ${new Date(expiresAt).toISOString()}`);
            console.log(`Is Expired (Calc): ${isExpired}`);
            console.log(`TargetUser: ${d.targetUser}`);
            console.log('---');
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const parseTimeframe = (timeframeStr) => {
    if (!timeframeStr) return 24 * 60 * 60 * 1000;
    const value = parseInt(timeframeStr);
    if (timeframeStr.includes('m')) return value * 60 * 1000;
    if (timeframeStr.includes('h')) return value * 60 * 60 * 1000;
    if (timeframeStr.includes('d')) return value * 24 * 60 * 60 * 1000;
    return value * 60 * 1000;
};

debugDares();
