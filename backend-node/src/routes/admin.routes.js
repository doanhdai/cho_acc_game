const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth.middleware');
const a = require('../controllers/admin.controller');

// Accounts
router.get('/accounts', adminAuth, a.adminGetAccounts);
router.post('/accounts', adminAuth, a.adminCreateAccount);
router.put('/accounts/:id', adminAuth, a.adminUpdateAccount);
router.delete('/accounts/:id', adminAuth, a.adminDeleteAccount);

// Skins Directory Management (Quản lý Data Game)
router.get('/skins', adminAuth, a.adminGetSkins);
router.post('/skins', adminAuth, a.adminCreateSkin);
router.put('/skins/:id', adminAuth, a.adminUpdateSkin);
router.delete('/skins/:id', adminAuth, a.adminDeleteSkin);

// Escrow Orders (Giao dịch trung gian)
router.get('/orders', adminAuth, a.adminGetOrders);

// Deposits
router.get('/deposits', adminAuth, a.adminGetDeposits);
router.put('/deposits/:id/approve', adminAuth, a.adminApproveDeposit);
router.put('/deposits/:id/reject', adminAuth, a.adminRejectDeposit);

// Analytics & History
router.get('/revenue', adminAuth, a.adminGetRevenue);
router.get('/history', adminAuth, a.adminGetHistory);

// Users
router.get('/users', adminAuth, a.adminGetUsers);

// News
router.get('/news', adminAuth, a.adminGetNews);
router.post('/news', adminAuth, a.adminCreateNews);
router.put('/news/:id', adminAuth, a.adminUpdateNews);
router.delete('/news/:id', adminAuth, a.adminDeleteNews);

module.exports = router;
