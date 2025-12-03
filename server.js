// src/server.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';

// Middleware
import { authenticateToken, isAdmin } from "./middleware/authMiddleware.js";

// Controllers (เอาเฉพาะที่จำเป็นต้องใช้ตรงนี้จริงๆ เช่น login)
import * as mainController from "./controllers/mainController.js";
import * as contactController from "./controllers/contactController.js";

// Routes (นำเข้า Route ที่เราแยกไว้)
import newsRoutes from "./routes/newsRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import serviceItemRoutes from "./routes/serviceItemRoutes.js";
import fileRoutes from "./routes/fileRoutes.js"; 
import folderRoutes from "./routes/folderRoutes.js"; 
import trashRoutes from "./routes/trashRoutes.js"; 
import employeeRoutes from "./routes/employeeRoutes.js"; 

// Config
const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GLOBAL CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Public Routes (Endpoints พิเศษที่ไม่อยู่ใน Route แยก) ---
app.get("/api/test", mainController.getApiTest);
app.post("/submit-form", contactController.createPublicContact);
app.post("/api/login", mainController.loginUser);

// File serving
app.use("/public/files", fileRoutes);

// --- API Routes (เชื่อมต่อกับไฟล์ Route ที่เราทำไว้) ---
// 🟢 สังเกตว่าเราใช้ app.use เชื่อมไปที่ Route เลย ไม่ต้องเรียก Controller ตรงนี้แล้ว
// 🟢 บาง Route เราใส่ Auth ไว้ในไฟล์ Route แล้ว (เช่น newsRoutes) ก็ไม่ต้องใส่ authenticateToken ตรงนี้ซ้ำก็ได้ 
// หรือจะใส่ดักไว้ชั้นแรกเลยก็ได้ (แต่ต้องระวัง Public route ข้างในจะเข้าไม่ได้)

// เพื่อความชัวร์และยืดหยุ่น ให้ไปจัดการ Auth ในไฟล์ Route ของแต่ละตัวดีกว่าครับ
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceItemRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/employees", employeeRoutes);

// --- DB + Server Start ---
console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(port, host, () => {
      console.log(`✅ Server running at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });