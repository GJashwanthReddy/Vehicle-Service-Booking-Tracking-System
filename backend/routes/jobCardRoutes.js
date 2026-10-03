const express = require('express');
const router = express.Router();
const jobCardController = require('../controllers/jobCardController');

router.get('/', jobCardController.getAllJobCards);
router.get('/:id', jobCardController.getJobCardById);
router.post('/', jobCardController.createJobCard);
router.put('/:id', jobCardController.updateJobCard);
router.post('/parts-used', jobCardController.addPartUsed);

module.exports = router;
