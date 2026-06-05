const express = require('express');
const router = express.Router();
const { createDeposit, getMyDeposits, getMyHistory, getMyAccounts, updateProfile } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/deposits', auth, createDeposit);
router.get('/deposits', auth, getMyDeposits);
router.get('/history', auth, getMyHistory);
router.get('/my-accounts', auth, getMyAccounts);
router.put('/profile', auth, updateProfile);

module.exports = router;
