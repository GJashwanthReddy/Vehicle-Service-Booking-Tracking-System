const express = require('express');
const router = express.Router();
const serviceHistoryController = require('../controllers/serviceHistoryController');

router.get('/', serviceHistoryController.getServiceHistory);

module.exports = router;
