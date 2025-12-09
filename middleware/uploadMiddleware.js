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

// --- 1. Cloudinary (สำหรับรูปภาพ: News, Activity, Employee) ---
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sut-park-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], 
    resource_type: 'auto', 
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
        // 🟢 [FIX 1] แก้ชื่อภาษาต่างด้าว (Latin1 -> UTF8)
        // ต้องแปลง Buffer กลับมาเป็น UTF-8 ก่อน ไม่งั้นภาษาไทยจะเป็น alien
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // 🟢 [FIX 2] แยกนามสกุลไฟล์ออกมา (สำคัญมากสำหรับ Raw File)
        // ถ้าไม่ต่อนามสกุลเอง Cloudinary บางทีจะไม่ใส่ให้ ทำให้โหลดมาแล้วเปิดไม่ได้
        const parts = originalName.split('.');
        const ext = parts.pop(); // นามสกุล (เช่น pdf)
        const nameWithoutExt = parts.join('.'); // ชื่อไฟล์เฉยๆ

        // 🟢 [FIX 3] ล้างชื่อไฟล์ (เก็บภาษาไทย ก-๙ ไว้)
        // แทนที่เว้นวรรคด้วย - และลบอักษรพิเศษที่ไม่ใช่ ไทย/อังกฤษ/ตัวเลข
        const safeName = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_ก-๙]/g, '');
        
        // ผลลัพธ์: 176526...-ประกาศiso17025รวม.pdf
        return `${Date.now()}-${safeName}.${ext}`;
    }
  },
});

export const documentUpload = multer({ storage: documentStorage });