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

// 🟢 Import Middleware ตรวจสอบสิทธิ์ (Auth)
// (ชื่อไฟล์อาจจะต่างกัน เช็คดูนะครับว่าของแจ้มชื่อ authMiddleware.js หรือเปล่า)
import { authenticateToken } from '../middleware/authMiddleware.js'; 

// 🟢 Import Middleware สำหรับอัปโหลดรูป (ถ้ามี)
import { upload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- Public Routes (ใครก็ได้เข้าดูได้) ---
router.get('/public', getPublicNews);
router.get('/:id', getNewsById);

// --- Protected Routes (ต้อง Login เท่านั้น) ---
// ต้องใส่ authenticateToken คั่นไว้หน้าฟังก์ชันเสมอ

router.get('/', authenticateToken, getAllNews); // Admin ดูทั้งหมด (รวมที่ซ่อน)

// สร้างข่าว (มีอัปโหลดรูป)
router.post('/', authenticateToken, upload.single('image'), createNews);

// แก้ไขข่าว (มีอัปโหลดรูป)
router.put('/:id', authenticateToken, upload.single('image'), updateNews);

// ⭐️ ลบข่าว (จุดสำคัญ! ต้องมี authenticateToken)
router.delete('/:id', authenticateToken, deleteNews);

export default router;