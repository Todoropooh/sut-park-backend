// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ใช้ memory storage แทน folder temp
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // อัปโหลดไป Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "sut-park" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ success: false, message: error.message });
        }
        res.json({ success: true, url: result.secure_url });
      }
    );

    result.end(req.file.buffer); // ส่ง buffer ของไฟล์ไป upload
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

export default router;
