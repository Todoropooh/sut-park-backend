import express from "express";
import Log from "../models/Log.js"; 

const router = express.Router();

// 1. GET API: ดึงข้อมูล Log
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Export Function: สร้าง Log
// ✅ จุดสำคัญ: ห้ามมีบรรทัด import { createLog } from ... เด็ดขาด!
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

// เพิ่มต่อท้ายไฟล์ ก่อน export default
router.post("/", async (req, res) => {
  try {
    const { action, detail, by, role } = req.body;
    
    // เรียกใช้ฟังก์ชัน createLog ที่เราเขียนไว้ในไฟล์เดียวกัน
    await createLog(action, detail, by, role);
    
    res.json({ message: "Log saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save log" });
  }
});

export default router;