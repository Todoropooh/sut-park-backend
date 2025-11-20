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
import * as newsController from "./controllers/newsController.js";
import * as activityController from "./controllers/activityController.js";
import * as bookingController from "./controllers/bookingController.js";
import * as contactController from "./controllers/contactController.js";
import * as mainController from "./controllers/mainController.js";
import * as serviceItemController from "./controllers/serviceItemController.js";
import * as folderController from "./controllers/folderController.js"; // (เพิ่ม import นี้ให้เผื่อ error)

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

// Config
const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️⭐️⭐️ [FIXED] Global CORS Configuration ⭐️⭐️⭐️
// เปิดอนุญาตให้ทุก Origin (*) เข้าถึงได้ เพื่อแก้ปัญหา CORS Policy
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // (แก้ path ให้ชัวร์ขึ้น)

// --- Public Routes (ไม่ต้องใส่ cors() แยกแล้ว เพราะมี Global ด้านบน) ---
app.get("/api/test", mainController.getApiTest);
app.get("/public/news", newsController.getPublicNews);
app.get("/public/activities", activityController.getPublicActivities);
app.get("/public/bookings", bookingController.getPublicBookings);
app.get("/public/services", serviceItemController.getPublicServiceItems);

app.post("/submit-form", contactController.createPublicContact);
app.post("/api/login", mainController.loginUser);

// File serving
app.use("/public/files", fileRoutes);

// --- Admin Protected Routes (ใช้ Global CORS แต่ติด Auth Middleware) ---
app.use("/api/dashboard", authenticateToken, isAdmin, dashboardRoutes);
app.use("/api/news", authenticateToken, isAdmin, newsRoutes);
app.use("/api/activities", authenticateToken, isAdmin, activityRoutes);
app.use("/api/bookings", authenticateToken, isAdmin, bookingRoutes);
app.use("/api/contacts", authenticateToken, isAdmin, contactRoutes);
app.use("/api/documents", authenticateToken, isAdmin, documentRoutes);
app.use("/api/users", authenticateToken, isAdmin, userRoutes);
app.use("/api/services", authenticateToken, isAdmin, serviceItemRoutes);
app.use("/api/folders", authenticateToken, isAdmin, folderRoutes);
app.use("/api/trash", authenticateToken, isAdmin, trashRoutes);

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
  