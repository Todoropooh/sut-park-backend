// routes/bookingRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as bookingController from '../controllers/bookingController.js';

// (Path '/' ที่นี่ หมายถึง '/api/bookings')

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)