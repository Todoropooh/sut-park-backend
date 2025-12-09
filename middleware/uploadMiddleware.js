// src/middleware/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- Config Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. Cloudinary (สำหรับรูปภาพ) ---
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
    resource_type: 'auto', 
  },
});

export const upload = multer({ storage: imageStorage });

// --- 2. ⭐️ Cloudinary (สำหรับเอกสาร) แก้ปัญหานามสกุลหาย ---
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-documents',
    // ❌ เอา allowed_formats ออก (เพื่อให้ Cloudinary ไม่พยายามแปลงไฟล์หรือตัดนามสกุล)
    // allowed_formats: [...], 
    
    resource_type: 'raw', // สำคัญมาก! บอกว่าเป็นไฟล์ดิบ
    
    public_id: (req, file) => {
        // 1. แก้ชื่อภาษาต่างด้าว (Latin1 -> UTF8)
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // 2. แยกนามสกุลไฟล์
        const parts = originalName.split('.');
        const ext = parts.length > 1 ? parts.pop() : ''; 
        const nameWithoutExt = parts.join('.');

        // 3. ล้างชื่อไฟล์ (เก็บไทย/อังกฤษ/ตัวเลข)
        const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
        
        // 4. คืนค่าชื่อไฟล์พร้อมนามสกุล (เช่น ...-iso17025.pdf)
        // Cloudinary แบบ Raw จะใช้นามสกุลจากตรงนี้เลย
        return `${Date.now()}-${safeName}.${ext}`;
    }
  },
});

export const documentUpload = multer({ storage: documentStorage });