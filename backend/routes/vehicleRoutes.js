const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getAllVehicles);
router.get('/customer/:customerId', vehicleController.getVehiclesByCustomer);
router.post('/', vehicleController.addVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
