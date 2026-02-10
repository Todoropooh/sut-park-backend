import express from "express";
import Log from "../models/Log.js";

const router = express.Router();

// 🟢 GET: ดึง Log ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟡 ฟังก์ชันสร้าง Log (ต้อง export แบบนี้เพื่อให้ไฟล์อื่นเรียกใช้ได้)
// ❌ ห้าม import createLog ในไฟล์นี้เด็ดขาด เพราะเรากำลังสร้างมันอยู่ที่นี่
export const createLog = async (action, detail, by, role) => {
  try {
    const newLog = new Log({ 
      action, 
      detail, 
      by: by || "System", 
      role: role || "Unknown" 
    });
    await newLog.save();
    console.log(`📝 Log Saved: ${action}`);
  } catch (error) {
    console.error("❌ Error saving log:", error);
  }
};

export default router;