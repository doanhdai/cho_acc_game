const express = require('express');
const router = express.Router();
const { walletCallback } = require('../controllers/wallet.controller');

router.post('/callback', walletCallback);

module.exports = router;
