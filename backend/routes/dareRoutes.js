const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const { createDare, getDares, getDareById, joinDare, submitDareProof, verifyDareProof, ignoreDare } = require('../controllers/dareController');
const { protect, protectOptional } = require('../middleware/authMiddleware');
const { validateDare } = require('../middleware/validation');

router.route('/')
    .get(protectOptional, getDares)
    .post(protect, validateDare, createDare);

router.route('/:id')
    .get(getDareById);

router.route('/:id/join')
    .post(protect, joinDare);

router.route('/:id/ignore')
    .post(protect, ignoreDare);

router.route('/:id/submit')
    .post(protect, upload.single('proof'), submitDareProof);

router.route('/:id/verify')
    .post(protect, verifyDareProof);

module.exports = router;
