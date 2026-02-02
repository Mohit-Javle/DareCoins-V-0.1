const express = require('express');
const router = express.Router();
const { getUserProfile, getMe, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard); // Must be before /:username
router.get('/me', protect, getMe);
router.get('/:username', getUserProfile);

module.exports = router;
