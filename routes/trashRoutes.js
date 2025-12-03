// src/routes/trashRoutes.js

import express from 'express';
import { 
    getTrashItems, 
    restoreItem, 
    deleteItemPermanently 
} from '../controllers/trashController.js';

// 🟢 แก้จาก middlewares -> middleware (ตัด s ออก)
import { authenticateToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// ดึงข้อมูลถังขยะ
router.get('/', authenticateToken, getTrashItems);

// กู้คืน (รับ ID จาก URL)
router.post('/restore/:id', authenticateToken, restoreItem);

// ลบถาวร (รับ ID จาก URL)
router.delete('/:id', authenticateToken, deleteItemPermanently);

export default router;