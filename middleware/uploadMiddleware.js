import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path'; // 🟢 เพิ่ม import path

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. Cloudinary (Images) ---
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
    resource_type: 'auto', 
  },
});

export const upload = multer({ storage: imageStorage });

// --- 2. ⭐️ Cloudinary (Documents) ท่าไม้ตาย ---
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
      // 🟢 1. แก้ชื่อภาษาต่างด้าว (Latin1 -> UTF8)
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      // 🟢 2. ดึงนามสกุลไฟล์ออกมา (เช่น .pdf)
      const ext = path.extname(originalName); // ได้ .pdf
      const nameWithoutExt = path.basename(originalName, ext); // ได้ชื่อไฟล์

      // 🟢 3. ล้างชื่อไฟล์ (Clean Name)
      const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
      const finalFileName = `${Date.now()}-${safeName}`;

      return {
          folder: 'sut-park-documents',
          resource_type: 'raw', // บังคับเป็นไฟล์ดิบ
          
          // 🟢 4. บังคับใส่ชื่อไฟล์ + นามสกุล (Manual Override)
          // ต้องใส่ทั้ง public_id และ format เพื่อกันพลาด
          public_id: finalFileName + ext, 
          format: ext.replace('.', ''), // ส่ง pdf (ตัดจุดออก) ไปบอก Cloudinary ด้วย
      };
  },
});

export const documentUpload = multer({ storage: documentStorage });