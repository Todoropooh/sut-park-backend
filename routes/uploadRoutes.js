import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import uploadRoutes from "./routes/uploadRoutes.js";
app.use("/api/upload", cors(publicCorsOptions), uploadRoutes);

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // เก็บไฟล์ชั่วคราว

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "sut-park",
    });

    // ลบไฟล์ออกจากเครื่องหลังอัปโหลดเสร็จ
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      url: result.secure_url, // ✅ URL ที่ Cloudinary ให้มา
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
});

export default router;
