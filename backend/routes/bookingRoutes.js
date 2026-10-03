const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
