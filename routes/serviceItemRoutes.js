import express from "express";
import multer from "multer";
import { 
  createServiceItem,
  updateServiceItem,
  deleteServiceItem
} from "../controllers/serviceItemController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // โฟลเดอร์ชั่วคราว

// POST เพิ่มรายการ + อัปโหลดรูป
router.post("/", upload.single("imageUrl"), createServiceItem);

// PUT แก้ไขรายการ + อัปโหลดรูป
router.put("/:id", upload.single("imageUrl"), updateServiceItem);

// DELETE ลบรายการ
router.delete("/:id", deleteServiceItem);

export default router;
