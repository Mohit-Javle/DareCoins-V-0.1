const express = require('express');
const router = express.Router();
const { createTruth, getTruths, answerTruth, verifyTruth } = require('../controllers/truthController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(getTruths)
    .post(protect, createTruth); // Add validation middleware if needed later

router.route('/:id/answer')
    .post(protect, upload.single('proof'), answerTruth);

router.route('/:id/verify')
    .post(protect, verifyTruth);

module.exports = router;
