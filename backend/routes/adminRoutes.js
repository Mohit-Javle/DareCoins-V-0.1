const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getAdminStats, getAllUsers, updateUser, getAllDares, deleteDare, getAllTruths, deleteTruth, getAllTransactions, getAnalyticsData } = require('../controllers/adminController');

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUser);
router.get('/dares', protect, admin, getAllDares);
router.delete('/dares/:id', protect, admin, deleteDare);
router.get('/truths', protect, admin, getAllTruths);
router.delete('/truths/:id', protect, admin, deleteTruth);
router.get('/transactions', protect, admin, getAllTransactions);
router.get('/analytics', protect, admin, getAnalyticsData);

module.exports = router;
