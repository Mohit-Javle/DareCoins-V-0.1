const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment, mockPayment } = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/mock-payment', protect, mockPayment);

module.exports = router;
