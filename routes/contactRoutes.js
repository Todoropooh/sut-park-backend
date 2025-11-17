// routes/contactRoutes.js (Corrected ESM)

import express from 'express'; // (โค้ดเดิม)
const router = express.Router();

// (โค้ดเดิม)
import * as contactController from '../controllers/contactController.js';

// (Path '/' ที่นี่ หมายถึง '/api/contacts')

// ⭐️⭐️⭐️ (นี่คือบรรทัดที่เพิ่มเข้ามาครับ) ⭐️⭐️⭐️
// (ต้องอยู่ก่อน /:id เสมอ)
router.get('/unread-count', contactController.getUnreadCount);

router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.patch('/:id/read', contactController.updateContactReadStatus); // (ใช้ PATCH สำหรับอัปเดตเล็กน้อย)
router.delete('/:id', contactController.deleteContact);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)  