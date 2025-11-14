// routes/contactRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as contactController from '../controllers/contactController.js';

// (Path '/' ที่นี่ หมายถึง '/api/contacts')

router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.patch('/:id/read', contactController.updateContactReadStatus); // (ใช้ PATCH สำหรับอัปเดตเล็กน้อย)
router.delete('/:id', contactController.deleteContact);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)