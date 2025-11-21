import express from 'express';
import multer from 'multer'; // ⭐️ 1. นำเข้า multer
import fs from 'fs';         // ⭐️ 2. นำเข้า fs เพื่อเช็คโฟลเดอร์
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

// --- 3. ตั้งค่าที่เก็บไฟล์ (Logic สร้างโฟลเดอร์อัตโนมัติ) ---
const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ⭐️ แก้ชื่อไฟล์ภาษาไทยให้ปลอดภัย + ใส่ Timestamp
    const safeName = Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

// --- Routes ---

// ⭐️ เปลี่ยนจาก .single('documentFile') เป็น .array('files') 
// เพื่อให้ตรงกับ Frontend ที่เราใช้ Dragger Upload หลายไฟล์พร้อมกัน
router.post('/upload', upload.array('files'), documentController.uploadDocument);

// ลบไฟล์
router.delete('/:id', documentController.deleteDocument);

// (Optional) Download หรือ Get All (ถ้ายังใช้อยู่)
router.get('/', documentController.getAllDocuments);
router.get('/:id/download', documentController.downloadDocument);

export default router;