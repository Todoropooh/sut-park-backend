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
    folder: 'sut-park-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

export const upload = multer({ storage: imageStorage });


// --- 2. Local Storage (สำหรับเอกสาร: Documents) ---
// 🟢 [FIXED] ใช้ process.cwd() เพื่อให้ชัวร์ว่า Path ถูกต้องบน Render
const uploadDir = path.join(process.cwd(), 'uploads/documents');

// สร้างโฟลเดอร์ถ้ายังไม่มี (บรรทัดนี้สำคัญมาก!)
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
        // แก้ชื่อไฟล์ภาษาไทย
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // ลบช่องว่างและตัวอักษรพิเศษออกเพื่อความปลอดภัย
        const safeName = originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

export const documentUpload = multer({ storage: documentStorage });