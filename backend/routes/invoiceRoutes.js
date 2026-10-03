const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getAllInvoices);
router.post('/generate', invoiceController.generateInvoice);
router.put('/:id/payment', invoiceController.updatePaymentStatus);

module.exports = router;
