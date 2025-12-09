import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// --- Config Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. Cloudinary (Images / News / Announcements) ---
// รองรับรูปภาพและ PDF (สำหรับข่าว) แก้ชื่อภาษาต่างด้าว
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 🟢 1. แก้ชื่อภาษาต่างด้าว (Latin1 -> UTF8)
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // 🟢 2. แยกชื่อกับนามสกุล
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    
    // 🟢 3. ล้างชื่อไฟล์ (เก็บไทย/อังกฤษ/ตัวเลข)
    const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
    
    return {
      folder: 'sut-park-images',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
      resource_type: 'auto', // ให้ Cloudinary จัดการเอง (Image หรือ PDF-Image)
      
      // สำหรับ imageStorage (auto) ปกติไม่ต้องใส่นามสกุลใน public_id เดี๋ยว Cloudinary เติมให้
      public_id: `${Date.now()}-${safeName}`, 
    };
  },
});

export const upload = multer({ storage: imageStorage });


// --- 2. Cloudinary (Documents) ---
// สำหรับหน้าเอกสาร (Raw Files) แก้ชื่อภาษาต่างด้าว + บังคับนามสกุล
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 🟢 1. แก้ชื่อภาษาต่างด้าว
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // 🟢 2. แยกนามสกุล
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);

    // 🟢 3. ล้างชื่อไฟล์
    const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
    const finalFileName = `${Date.now()}-${safeName}`;

    return {
        folder: 'sut-park-documents',
        resource_type: 'raw', // บังคับเป็นไฟล์ดิบ
        
        // 🟢 4. บังคับใส่ชื่อไฟล์ + นามสกุล (Manual Override)
        public_id: finalFileName + ext, 
        format: ext.replace('.', ''), // ส่ง pdf/docx ไปบอก Cloudinary ด้วย
    };
  },
});

export const documentUpload = multer({ storage: documentStorage });