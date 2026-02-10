import express from "express";
import Statistic from "../models/Statistic.js"; // ตรวจสอบว่ามีไฟล์ Model นี้
import { createLog } from "./logRoutes.js";     // เรียกใช้ฟังก์ชันเก็บ Log

const router = express.Router();

// 🟢 GET: ดึงค่าสถิติ
// URL: /api/statistics-settings
router.get("/", async (req, res) => {
  try {
    // หาข้อมูล ถ้าไม่มีให้สร้างใหม่
    let stats = await Statistic.findOne();
    if (!stats) {
      stats = new Statistic();
      await stats.save();
    }
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🟠 PUT: อัปเดตค่าสถิติ
// URL: /api/statistics-settings (หน้าบ้านเรียกมาที่ root นี้ ไม่ใช่ /update)
router.put("/", async (req, res) => {
  try {
    const { 
      employment, smes, enrollment, products, income, awards, 
      updatedBy, role 
    } = req.body;

    // 1. อัปเดตข้อมูลลง Database
    let stats = await Statistic.findOne();
    if (!stats) stats = new Statistic();

    // ใช้ ?? เพื่อให้ค่าที่เป็น 0 ไม่ถูกมองว่าว่าง
    stats.employment = employment ?? stats.employment;
    stats.smes = smes ?? stats.smes;
    stats.enrollment = enrollment ?? stats.enrollment;
    stats.products = products ?? stats.products;
    stats.income = income ?? stats.income;
    stats.awards = awards ?? stats.awards;
    stats.lastUpdated = new Date();

    await stats.save();

    // 2. บันทึก Log (ใส่ try-catch กันเหนียว เพื่อไม่ให้กระทบการบันทึกข้อมูลหลัก)
    try {
      const logDetail = `รายได้: ${income}, ผลิตภัณฑ์: ${products}`;
      await createLog(
        "Update KPI",           // Action
        logDetail,              // Detail
        updatedBy || "Admin",   // By
        role || "Super Admin"   // Role
      );
    } catch (logError) {
      console.warn("⚠️ Log Error (Ignored):", logError.message);
    }

    res.json({ message: "Update success", data: stats });

  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;