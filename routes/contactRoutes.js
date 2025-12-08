// routes/contactRoutes.js (โค้ดที่ถูกต้อง)

import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

// 🟢 [FIXED] เพิ่มเส้นทางสำหรับส่งข้อความใหม่ (POST)
router.post('/', contactController.createPublicContact); 

// --- Admin Routes ---
router.get('/', contactController.getAllContacts);
router.get('/unread-count', contactController.getUnreadCount); 
router.delete('/:id', contactController.deleteContact);
router.patch('/:id', contactController.updateContact);

export default router;