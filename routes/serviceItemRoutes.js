import express from "express";
import multer from "multer";
import fs from "fs"; // ⭐️ เพิ่ม fs เพื่อจัดการไฟล์/โฟลเดอร์
import * as serviceItemController from "../controllers/serviceItemController.js";

const router = express.Router();

// ตรวจสอบและสร้างโฟลเดอร์ uploads/services ถ้ายังไม่มี
const uploadDir = 'uploads/services';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ⭐️ [FIXED] แก้ชื่อไฟล์ภาษาไทยให้ปลอดภัย (แปลง latin1 -> utf8)
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // ลบช่องว่างและตัวอักษรพิเศษ
    const safeName = originalName.replace(/\s+/g, '-');
    
    cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({ storage });

// Routes
router.get("/", serviceItemController.getServiceItems);
router.get("/public", serviceItemController.getPublicServiceItems);

// ⭐️ upload.single("image") ต้องตรงกับ FormData ใน Frontend
router.post("/", upload.single("image"), serviceItemController.createServiceItem);
router.put("/:id", upload.single("image"), serviceItemController.updateServiceItem);
router.delete("/:id", serviceItemController.deleteServiceItem);

export default router;