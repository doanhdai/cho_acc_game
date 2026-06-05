const express = require('express');
const router = express.Router();
const { getAccounts, getAccountById, getCategories, getSkins, createAccount } = require('../controllers/account.controller');
const { auth } = require('../middleware/auth.middleware');

router.get('/categories', getCategories);
router.get('/skins', getSkins);
router.post('/create', auth, createAccount);
router.get('/', getAccounts);
router.get('/:id', (req, res, next) => { req._optionalAuth = true; next(); }, auth, getAccountById);

module.exports = router;
