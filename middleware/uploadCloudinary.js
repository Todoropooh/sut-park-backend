// middleware/uploadCloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// โหลดค่าจาก .env
dotenv.config();

// 1. ตั้งค่าการเชื่อมต่อ Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. กำหนดการตั้งค่า Storage (ที่เก็บไฟล์)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-services', // ⭐️ ชื่อโฟลเดอร์ที่จะไปโผล่ใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // นามสกุลไฟล์ที่ยอมรับ
    // transformation: [{ width: 1000, crop: "limit" }], // (Optional) ย่อรูปถ้ารูปใหญ่เกินไป
  },
});

// 3. สร้าง Middleware สำหรับ Upload
const uploadCloud = multer({ storage: storage });

export default uploadCloud;