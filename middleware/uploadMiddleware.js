// middleware/uploadMiddleware.js

const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');

// --- 1. Multer สำหรับรูปภาพ (News/Activities) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- 2. Multer สำหรับไฟล์เอกสาร (Documents) ---
// ⭐️ (สำคัญ) แก้ Path ให้ถอยหลัง 1 ชั้น (../) เพื่อไปที่ /uploads
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
const documentUpload = multer({ storage: documentStorage });

// ⭐️ Export ทั้งสองตัว
module.exports = {
    upload, // (สำหรับ News/Activities)
    documentUpload // (สำหรับ Documents)
};