const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet, transferCoins } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWallet);
router.post('/topup', protect, topUpWallet);
router.post('/transfer', protect, transferCoins);

module.exports = router;
