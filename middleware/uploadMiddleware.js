// src/middleware/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// --- 1. Cloudinary (สำหรับรูปภาพ: News, Activity, Employee) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images', // ชื่อโฟลเดอร์บน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

export const upload = multer({ storage: imageStorage });


// --- 2. Local Storage (สำหรับเอกสาร: Documents) ---
// ใช้ process.cwd() เพื่อให้ Path ถูกต้องเสมอบน Server (Render)
const uploadDir = path.join(process.cwd(), 'uploads/documents');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created directory: ${uploadDir}`);
}

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // เช็คอีกรอบกันเหนียว
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // 🟢 [FIX] แก้ชื่อไฟล์ภาษาไทยเพี้ยน
        // แปลงจาก latin1 (ค่า default ที่ multer อ่านผิด) กลับมาเป็น utf8
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        // ลบช่องว่างและตัวอักษรพิเศษออกเพื่อความปลอดภัย (เหลือไว้แค่ ไทย อังกฤษ ตัวเลข . - _)
        const safeName = originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
        
        // สร้างชื่อไฟล์ไม่ซ้ำกัน
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

export const documentUpload = multer({ storage: documentStorage });