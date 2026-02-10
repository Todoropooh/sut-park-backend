import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';

// Middleware
import { authenticateToken, isAdmin } from "./middleware/authMiddleware.js";

// Controllers (นำกลับมาเพื่อใช้กับ Public Route เดิม)
import * as mainController from "./controllers/mainController.js";
import * as contactController from "./controllers/contactController.js";
import * as newsController from "./controllers/newsController.js";
import * as activityController from "./controllers/activityController.js";
import * as serviceItemController from "./controllers/serviceItemController.js";
import * as employeeController from "./controllers/employeeController.js"; 

// Routes
import authRoutes from "./routes/authRoutes.js"; // 🟢 1. Import Auth Routes (สำคัญ!)
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
import statisticRoutes from "./routes/statisticRoutes.js"; 
import logRoutes from "./routes/logRoutes.js"; 

// Config
const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GLOBAL CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 🟢 Public Routes (แบบเดิมที่ test.html เรียกใช้) ---
app.get("/public/news", newsController.getPublicNews);
app.get("/public/activities", activityController.getPublicActivities);
app.get("/public/services", serviceItemController.getServiceItems); 
app.get("/public/employees", employeeController.getEmployees);      

app.get("/api/test", mainController.getApiTest);
app.post("/submit-form", contactController.createPublicContact);
// app.post("/api/login", mainController.loginUser); // อันเก่า (ถ้าไม่ได้ใช้แล้ว คอมเมนต์ทิ้งได้เลย)

// File serving
app.use("/public/files", fileRoutes);

// --- API Routes (สำหรับ Admin Dashboard) ---
app.use("/api/auth", authRoutes); // 🟢 2. เปิดใช้งานเส้นทาง Login/Auth (สำคัญมาก!)
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
app.use("/api/statistics-settings", statisticRoutes); 
app.use("/api/logs", logRoutes); 

// --- DB + Server Start ---
console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully!");
    
    // (Optional) ลบ Ghost Index ถ้ายังมีปัญหา
    try {
        await mongoose.connection.collection('documents').dropIndex('storedFilename_1');
    } catch (e) {}

    app.listen(port, host, () => {
      console.log(`✅ Server running at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });