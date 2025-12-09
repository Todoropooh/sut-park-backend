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


// --- 2. ⭐️ [แก้ไขใหม่] Cloudinary (สำหรับเอกสาร: Documents) ---
// ย้ายจาก Local Storage -> Cloudinary (แก้ปัญหาไฟล์หายบน Render)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-documents', // แยกโฟลเดอร์ให้เป็นระเบียบ
    // อนุญาตไฟล์เอกสารหลากหลายประเภท
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'], 
    
    // ⭐️ สำคัญ: ใช้ 'raw' เพื่อรองรับไฟล์ที่ไม่ใช่ media (เช่น Word/Excel) ได้อย่างปลอดภัย
    resource_type: 'raw', 
    
    // ตั้งชื่อไฟล์บน Cloud (Optional: เพื่อให้อ่านง่ายขึ้น)
    public_id: (req, file) => {
        // ตัดนามสกุลออกก่อน (Cloudinary เติมให้เองบางที หรือถ้าเป็น raw ต้องระวัง)
        // แต่เพื่อความชัวร์ ใช้ชื่อเดิมที่ Clean แล้ว + Timestamp
        const nameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
        const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        return `${Date.now()}-${safeName}`;
    }
  },
});

export const documentUpload = multer({ storage: documentStorage });