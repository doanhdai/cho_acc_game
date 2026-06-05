const express = require('express');
const router = express.Router();
const {
  createMiddlemanOrder,
  getOrderMessages,
  sendOrderMessage,
  completeMiddlemanOrder,
  cancelMiddlemanOrder,
  getOrderDetails,
  getMyOrders
} = require('../controllers/order.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/middleman/create', auth, createMiddlemanOrder);
router.get('/middleman/:id', auth, getOrderDetails);
router.get('/middleman/:id/messages', auth, getOrderMessages);
router.post('/middleman/:id/messages', auth, sendOrderMessage);
router.post('/middleman/:id/complete', auth, completeMiddlemanOrder);
router.post('/middleman/:id/cancel', auth, cancelMiddlemanOrder);
router.get('/my-orders', auth, getMyOrders);

module.exports = router;
