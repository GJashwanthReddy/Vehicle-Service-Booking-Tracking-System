const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceTypeController');

router.get('/', serviceTypeController.getAllServiceTypes);
router.post('/', serviceTypeController.addServiceType);

module.exports = router;
