import express from "express";
import Statistic from "../models/Statistic.js";
import { createLog } from "./logRoutes.js"; // ตรวจสอบว่าไฟล์นี้มีอยู่จริง

const router = express.Router();

// GET: ดึงค่าสถิติ
router.get("/", async (req, res) => {
  try {
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

// PUT: อัปเดตค่าสถิติ (แบบ Safe Mode)
router.put("/", async (req, res) => {
  try {
    const { 
      employment, smes, enrollment, products, income, awards, 
      updatedBy, role 
    } = req.body;

    // 1. อัปเดตข้อมูลหลัก (สำคัญที่สุด)
    let stats = await Statistic.findOne();
    if (!stats) stats = new Statistic();

    // อัปเดตค่าทีละตัว (ใช้ Nullish coalescing ?? เพื่อป้องกันค่า 0 หาย)
    stats.employment = employment ?? stats.employment;
    stats.smes = smes ?? stats.smes;
    stats.enrollment = enrollment ?? stats.enrollment;
    stats.products = products ?? stats.products;
    stats.income = income ?? stats.income;
    stats.awards = awards ?? stats.awards;
    stats.lastUpdated = new Date();

    await stats.save(); // 💾 บันทึกข้อมูลลง DB

    // 2. บันทึก Log (ใส่ Try-Catch แยก เพื่อไม่ให้กระทบการบันทึกหลัก)
    try {
        const logDetail = `Updated KPIs - Income: ${income}, Products: ${products}`;
        await createLog(
            "Update KPI", 
            logDetail, 
            updatedBy || "Admin", 
            role || "Super Admin"
        );
        console.log("✅ Log saved successfully");
    } catch (logError) {
        console.warn("⚠️ Stat updated but Log failed:", logError.message);
        // ไม่ throw error เพื่อให้ frontend ได้รับ success response
    }

    // ส่ง Response กลับไปบอกหน้าบ้านว่าสำเร็จ
    res.json({ message: "Update success", data: stats });

  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ message: "Update failed: " + error.message });
  }
});

export default router;