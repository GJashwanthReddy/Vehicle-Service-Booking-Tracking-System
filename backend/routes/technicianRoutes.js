const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');

router.get('/', technicianController.getAllTechnicians);
router.post('/', technicianController.addTechnician);
router.put('/:id/status', technicianController.updateTechnicianStatus);

module.exports = router;
