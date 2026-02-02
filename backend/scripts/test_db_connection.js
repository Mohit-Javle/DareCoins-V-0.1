require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');
        // Set a shorter timeout for testing
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('Full Error:', error);
        process.exit(1);
    }
};

connectDB();
