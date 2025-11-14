// middleware/uploadMiddleware.js (Corrected ESM)

import multer from 'multer'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
import path from 'path';   // 2. ⭐️ (แก้ไข) เปลี่ยน 'require'
import fs from 'fs';       // 3. ⭐️ (แก้ไข) เปลี่ยน 'require'
import { fileURLToPath } from 'url'; // 4. ⭐️ (เพิ่ม) สำหรับแก้ __dirname

// 5. ⭐️ (เพิ่ม) Fix __dirname ที่ไม่รองรับใน ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Multer สำหรับรูปภาพ (News/Activities) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});

// 6. ⭐️ (แก้ไข) เปลี่ยนเป็น 'export const'
export const upload = multer({ storage: storage });

// --- 2. Multer สำหรับไฟล์เอกสาร (Documents) ---
// (Path นี้จะทำงานได้เพราะเราแก้ __dirname แล้ว)
const documentUploadDir = path.join(__dirname, '../uploads/documents'); 
if (!fs.existsSync(documentUploadDir)){
    fs.mkdirSync(documentUploadDir, { recursive: true });
}
const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, documentUploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, uniqueSuffix + '-' + originalName);
    }
});

// 7. ⭐️ (แก้ไข) เปลี่ยนเป็น 'export const'
export const documentUpload = multer({ storage: documentStorage });
