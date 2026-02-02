const express = require('express');
const router = express.Router();
const { getContentFeed, getApprovedProofs } = require('../controllers/contentController');

router.get('/feed', getContentFeed);
router.get('/proofs', getApprovedProofs);

module.exports = router;
