// backend/routes/statisticRoutes.js
const express = require('express');
const router = express.Router();

// 👇 เรียกใช้ Controller ที่เราเพิ่งสร้าง
const { getStats, updateStats } = require('../controllers/statisticController');

// 🟢 1. เส้นทางดึงข้อมูล -> ให้วิ่งไปที่ฟังก์ชัน getStats
router.get('/', getStats);

// 🟢 2. เส้นทางบันทึก -> ให้วิ่งไปที่ฟังก์ชัน updateStats
router.put('/update', updateStats);

module.exports = router;