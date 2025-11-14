// routes/bookingRoutes.js

const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');

// (Path '/' ที่นี่ หมายถึง '/api/bookings')

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;