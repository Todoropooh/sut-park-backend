// src/routes/documentRoutes.js

import express from 'express';
import { 
    uploadDocument, 
    deleteDocument,
    getDocuments // 🟢 ต้อง import ชื่อให้ตรงกับที่มีใน Controller
} from '../controllers/documentController.js';

// 🟢 นำเข้า Middleware ที่เราทำไว้แล้ว (จะได้ไม่ต้องเขียนซ้ำ)
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { documentUpload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- Routes ---

// 1. อัปโหลดไฟล์ (ใช้ documentUpload จาก middleware)
// รับทีละหลายไฟล์ ชื่อ field 'files' ให้ตรงกับหน้าบ้าน
router.post('/upload', authenticateToken, documentUpload.array('files'), uploadDocument);

// 2. ลบไฟล์
router.delete('/:id', authenticateToken, deleteDocument);

// 3. ดึงรายการไฟล์ (ใช้ getDocuments ตามที่ Controller มี)
router.get('/', authenticateToken, getDocuments);

// (Optional) ถ้ายังไม่ได้ทำฟังก์ชัน download ใน controller ให้คอมเมนต์บรรทัดนี้ไปก่อนครับ ไม่งั้นจะ Error
// router.get('/:id/download', documentController.downloadDocument);

export default router;