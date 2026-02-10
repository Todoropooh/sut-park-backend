const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// 🟢 API: ดึงประวัติทั้งหมด (เรียงจากล่าสุดไปเก่าสุด)
// GET /api/logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(50); // ดึงแค่ 50 รายการล่าสุดพอ
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟡 ฟังก์ชันภายใน: สำหรับเรียกใช้บันทึก Log (ไม่ต้อง Export เป็น Route)
const createLog = async (action, detail, by, role) => {
  try {
    const newLog = new Log({ action, detail, by, role });
    await newLog.save();
    console.log(`[LOG] ${action}: ${detail} by ${by}`);
  } catch (err) {
    console.error('Error saving log:', err);
  }
};

// Export ทั้ง Router และฟังก์ชัน createLog ไปใช้ที่อื่น
module.exports = { router, createLog };