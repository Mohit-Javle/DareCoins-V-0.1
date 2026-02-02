const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserDetails, updateHighlights } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateUserDetails);
router.put('/highlights', protect, updateHighlights);

module.exports = router;
