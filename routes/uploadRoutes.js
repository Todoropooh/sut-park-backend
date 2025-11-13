import express from "express";
import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "ไม่มีไฟล์" });

  const result = await uploadToCloudinary(req.file.path, {
    folder: "sut-park" // จะอัปโหลดเข้า folder sut-park
  });

  if (result.success) {
    res.json({ success: true, url: result.url });
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

export default router;
