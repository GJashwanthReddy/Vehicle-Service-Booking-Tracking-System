const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePartController');

router.get('/', sparePartController.getAllSpareParts);
router.post('/', sparePartController.addSparePart);
router.put('/:id/stock', sparePartController.updateStock);

module.exports = router;
