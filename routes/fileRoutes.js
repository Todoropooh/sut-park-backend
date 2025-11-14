import express from "express";
import File from "../models/File.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 }); // เรียงล่าสุดก่อน
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
