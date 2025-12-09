// src/middleware/uploadMiddleware.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
// import path from 'path'; // ไม่ต้องใช้แล้ว เพราะขึ้น Cloud หมด
// import fs from 'fs';     // ไม่ต้องใช้แล้ว

dotenv.config();

// --- Config Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. Cloudinary (สำหรับรูปภาพ: News, Activity, Employee) ---
// รองรับ: JPG, PNG, WEBP และ PDF (สำหรับข่าวประกาศ)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images', // ชื่อโฟลเดอร์บน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
    resource_type: 'auto', // ให้ Cloudinary ตัดสินใจเองว่าเป็น image หรือ raw (pdf มักจะเป็น image/raw ได้)
  },
});

export const upload = multer({ storage: imageStorage });


// --- 2. Cloudinary (สำหรับเอกสาร: Documents) ---
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'],
    resource_type: 'raw', // สำคัญสำหรับไฟล์เอกสาร
    
    public_id: (req, file) => {
        // 🟢 [FIXED] แก้ไข logic การตั้งชื่อไฟล์
        // 1. แทนที่ช่องว่างด้วยขีด (-)
        const nameWithExt = file.originalname.replace(/\s+/g, '-');
        
        // 2. ลบตัวอักษรพิเศษออก แต่ *เก็บจุด (.) ไว้* เพื่อรักษานามสกุลไฟล์
        const safeName = nameWithExt.replace(/[^a-zA-Z0-9.\-_]/g, '');
        
        // ผลลัพธ์: 1765261126060-iso17025.pdf (มี .pdf กลับมาแล้ว!)
        return `${Date.now()}-${safeName}`;
    }
  },
});

export const documentUpload = multer({ storage: documentStorage });