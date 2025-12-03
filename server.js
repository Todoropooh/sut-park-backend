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

// Controllers
import * as mainController from "./controllers/mainController.js";
import * as contactController from "./controllers/contactController.js";

// Routes
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

// --- Public Routes ---
app.get("/api/test", mainController.getApiTest);
app.post("/submit-form", contactController.createPublicContact);
app.post("/api/login", mainController.loginUser);

// File serving
app.use("/public/files", fileRoutes);

// --- API Routes ---
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
  .then(async () => { // 🟢 เพิ่ม async เพื่อให้ใช้ await ข้างในได้
    console.log("✅ MongoDB connected successfully!");

    // 🟢 [FIX] คำสั่งลบ Index เก่าทิ้ง (Run Once)
    try {
        await mongoose.connection.collection('documents').dropIndex('storedFilename_1');
        console.log("🔥 LOB INDEX 'storedFilename_1' TING LEAW KRUB! (Index Dropped)");
    } catch (e) {
        // ถ้า Index ไม่มีอยู่แล้ว หรือลบไปแล้ว จะเข้าตรงนี้ ไม่เป็นไรครับ
        console.log("ℹ️ Index might already be deleted or not found (Safe to ignore)");
    }

    app.listen(port, host, () => {
      console.log(`✅ Server running at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });