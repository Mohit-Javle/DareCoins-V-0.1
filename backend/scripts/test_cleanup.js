require('dotenv').config();
const mongoose = require('mongoose');
const Dare = require('../models/Dare');
const User = require('../models/User');
const { cleanupExpiredDares, verifyDareProof } = require('../controllers/dareController');

// Mock req/res for controller testing
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    try {
        // --- TEST 1: Expiration Cleanup ---
        console.log('\n--- Test 1: Expiration Cleanup ---');
        // Create an expired dare
        const expiredDare = await Dare.create({
            creator: (await User.findOne())._id, // Use any existing user
            title: 'Test Expired Dare',
            description: 'Should be deleted',
            reward: 10,
            timeframe: '1m',
            expiresAt: new Date(Date.now() - 10000) // Expired 10s ago
        });
        console.log(`Created expired dare: ${expiredDare._id}`);

        // Run cleanup manually
        await cleanupExpiredDares();

        const checkExpired = await Dare.findById(expiredDare._id);
        if (!checkExpired) {
            console.log('SUCCESS: Expired dare was deleted.');
        } else {
            console.error('FAILURE: Expired dare still exists!');
        }

        // --- TEST 2: Completion Cleanup ---
        console.log('\n--- Test 2: Completion Cleanup ---');
        const users = await User.find().limit(2);
        if (users.length < 2) {
            console.log('Skipping Test 2: Need at least 2 users.');
            process.exit(0);
        }
        const [creator, participant] = users;

        const activeDare = await Dare.create({
            creator: creator._id,
            title: 'Test Completion Dare',
            description: 'Should be deleted on completion',
            reward: 10,
            timeframe: '1h',
            participants: [{ user: participant._id, status: 'pending_review' }]
        });
        console.log(`Created active dare: ${activeDare._id}`);

        // Mock Request for verify
        const req = {
            params: { id: activeDare._id },
            user: { id: creator._id.toString() },
            body: { participantId: participant._id.toString(), approved: true }
        };
        const res = mockRes();

        // Call controller directly
        // We need to bind the function to exports context if it uses 'this', but it doesn't.
        // However, 'verifyDareProof' is exported.
        // Re-importing to ensure we get the updated version? 
        // require cache might need clearing if I updated the file in the same process, 
        // but this is a fresh process run.

        // Note: We need to import the updated controller
        const dareController = require('../controllers/dareController');
        await dareController.verifyDareProof(req, res);

        console.log('Controller Response:', res.statusCode, res.data);

        const checkCompleted = await Dare.findById(activeDare._id);
        if (!checkCompleted) {
            console.log('SUCCESS: Completed dare was deleted.');
        } else {
            console.error('FAILURE: Completed dare still exists!');
            console.log(checkCompleted);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

runTest();
