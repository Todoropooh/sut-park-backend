// src/middleware/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// --- 1. ⭐️ Cloudinary (แก้ไขให้รองรับ PDF) ---
// ใช้สำหรับ: News, Activity, Employee (ไฟล์จะไม่หายเมื่อ Deploy ใหม่)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images', // ชื่อโฟลเดอร์บน Cloudinary
    // ⭐️ 1. เพิ่ม 'pdf' เข้าไปในนี้ครับ
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
    // ⭐️ 2. (สำคัญ) บอก Cloudinary ว่าให้จัดการ resource_type แบบ auto (เพื่อรองรับไฟล์ที่ไม่ใช่รูป)
    resource_type: 'auto', 
  },
});

export const upload = multer({ storage: imageStorage });


// --- 2. Local Storage (สำหรับเอกสาร: Documents) ---
// (ส่วนนี้เหมือนเดิม ใช้สำหรับเอกสารราชการที่ยอมให้เก็บ Local ได้ หรือถ้าอยากย้ายไป Cloudinary ก็แก้แบบข้างบนครับ)
const uploadDir = path.join(process.cwd(), 'uploads/documents');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created directory: ${uploadDir}`);
}

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // แก้ชื่อไฟล์ภาษาไทยเพี้ยน
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const safeName = originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

export const documentUpload = multer({ storage: documentStorage });