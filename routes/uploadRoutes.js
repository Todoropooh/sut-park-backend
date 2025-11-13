import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { File } from "../models/File.js"; // ✅ import model

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // เก็บไฟล์ชั่วคราว

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "sut-park",
      upload_preset: "my_upload" // preset แบบ unsigned
    });

    // ลบไฟล์ temp หลังอัปโหลด
    fs.unlinkSync(req.file.path);

    // บันทึก URL ลง MongoDB
    const newFile = new File({
      filename: req.file.originalname,
      url: result.secure_url
    });
    await newFile.save();

    res.json({
      success: true,
      url: result.secure_url
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message
    });
  }
});

export default router;
