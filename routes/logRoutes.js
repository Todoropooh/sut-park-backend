import express from "express";
import Log from "../models/Log.js"; // ต้องมี model Log ด้วย

const router = express.Router();

// GET: ดึง Log ทั้งหมด (เรียงล่าสุดก่อน)
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ฟังก์ชันสำหรับบันทึก Log (Export ไปใช้ที่อื่นได้)
export const createLog = async (action, detail, by, role) => {
  try {
    const newLog = new Log({ action, detail, by, role });
    await newLog.save();
  } catch (error) {
    console.error("Error saving log:", error);
  }
};

export default router;