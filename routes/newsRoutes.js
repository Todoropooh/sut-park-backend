// src/routes/newsRoutes.js

import express from 'express';
import { 
    getPublicNews, 
    getAllNews, 
    getNewsById, 
    createNews, 
    updateNews, 
    deleteNews 
} from '../controllers/newsController.js';

// Import Middleware
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { upload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- Public Routes (ใครก็ได้เข้าดูได้) ---

// 🟢 แก้ไขแล้ว: เอา authenticateToken ออก เพื่อให้ดึงข่าวทั้งหมดได้โดยไม่ต้อง Login
router.get('/', getAllNews); 

router.get('/public', getPublicNews);
router.get('/:id', getNewsById);

// --- Protected Routes (ต้อง Login เท่านั้น) ---
// ส่วนการสร้าง/แก้ไข/ลบ ยังคงต้องใช้ Token เหมือนเดิม เพื่อความปลอดภัย

// สร้างข่าว (มีอัปโหลดรูป)
router.post('/', authenticateToken, upload.single('image'), createNews);

// แก้ไขข่าว (มีอัปโหลดรูป)
router.put('/:id', authenticateToken, upload.single('image'), updateNews);

// ลบข่าว
router.delete('/:id', authenticateToken, deleteNews);

export default router;