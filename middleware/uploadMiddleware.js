// src/middleware/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path'; // เก็บไว้เผื่อใช้ utility อื่นๆ
import fs from 'fs';     // เก็บไว้เผื่อใช้

dotenv.config();

// 1. ตั้งค่า Cloudinary (ดึง Key จาก .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage สำหรับ "รูปภาพ" (News, Activities, Employees) -> ไป Cloudinary
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images', // ชื่อโฟลเดอร์บน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // transformation: [{ width: 1000, crop: "limit" }], // (Optional) ย่อรูปอัตโนมัติ
  },
});

export const upload = multer({ storage: imageStorage });


// 3. Storage สำหรับ "เอกสาร" (Documents) -> เก็บ Local (หรือจะไป Cloudinary ก็ได้)
// *หมายเหตุ: ถ้าเอกสารสำคัญและไม่อยากให้หายบน Render ควรใช้ Cloudinary เหมือนกัน หรือ AWS S3*
// แต่ถ้าเอาแบบเดิมที่เคยเขียนไว้ (เก็บ Local) ก็ใช้โค้ดส่วนนี้ครับ:

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const documentUploadDir = path.join(__dirname, '../uploads/documents'); 
if (!fs.existsSync(documentUploadDir)){
    fs.mkdirSync(documentUploadDir, { recursive: true });
}

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, documentUploadDir); 
    },
    filename: function (req, file, cb) {
        // แก้ชื่อไฟล์ภาษาไทยให้ไม่เพี้ยน
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + originalName);
    }
});

export const documentUpload = multer({ storage: documentStorage });