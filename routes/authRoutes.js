import express from "express";
import { login } from "../controllers/authController.js"; 

const router = express.Router();

// 🟢 สร้างเส้นทาง /login
router.post("/login", login);

export default router;