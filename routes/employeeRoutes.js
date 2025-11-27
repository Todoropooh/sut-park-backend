import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees // ⭐️ Import ฟังก์ชันใหม่เข้ามา
} from "../controllers/employeeController.js";

const router = express.Router();

// เส้นทาง API
router.get("/", getEmployees);
router.post("/", createEmployee);
router.post("/import", importEmployees); // ⭐️ Route สำหรับรับข้อมูลจาก Excel
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;