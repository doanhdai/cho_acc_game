const express = require('express');
const router = express.Router();
const { getNews, getNewsDetail, getTopDeposit } = require('../controllers/news.controller');

router.get('/top-deposit', getTopDeposit);
router.get('/', getNews);
router.get('/:slug', getNewsDetail);

module.exports = router;
