const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('If you are seeing a connection error, please check:');
        console.error('1. Your IP address is whitelisted in MongoDB Atlas.');
        console.error('2. Your internet connection is active.');
        console.error('3. The MONGO_URI in .env is correct.');

        // Retry logic instead of immediate exit
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
