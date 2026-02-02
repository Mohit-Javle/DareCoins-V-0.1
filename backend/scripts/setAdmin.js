const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const setAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = process.argv[2];

        if (!username) {
            console.log('Please provide a username. Usage: node scripts/setAdmin.js <username>');
            process.exit(1);
        }

        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User '${username}' not found.`);
            console.log('Available users:');
            const users = await User.find({}).select('username');
            users.forEach(u => console.log(` - ${u.username}`));
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User '${username}' is now an Admin!`);
        console.log('You can now access http://localhost:5173/admin');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

setAdmin();
