// routes/serviceItemRoutes.js

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
    // ⭐️ ใช้ตัวแปร path ที่เราสร้างไว้
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ⭐️ ลบช่องว่างในชื่อไฟล์ออกเพื่อป้องกันปัญหา URL
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Routes
router.get("/", serviceItemController.getServiceItems); // (สำหรับ Admin หรือ Public ก็ได้ แล้วแต่การจัดการ)
router.get("/public", serviceItemController.getPublicServiceItems);

// ⭐️ upload.single("image") ต้องตรงกับ FormData ใน Frontend
router.post("/", upload.single("image"), serviceItemController.createServiceItem);
router.put("/:id", upload.single("image"), serviceItemController.updateServiceItem);
router.delete("/:id", serviceItemController.deleteServiceItem);

export default router;