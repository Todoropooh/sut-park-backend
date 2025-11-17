// server.js (Updated)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

// Middleware
import { authenticateToken, isAdmin } from "./middleware/authMiddleware.js";

// Controllers
import * as newsController from "./controllers/newsController.js";
import * as activityController from "./controllers/activityController.js";
import * as bookingController from "./controllers/bookingController.js";
import * as contactController from "./controllers/contactController.js";
import * as mainController from "./controllers/mainController.js";
import * as serviceItemController from "./controllers/serviceItemController.js";

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
import trashRoutes from "./routes/trashRoutes.js"; // ⭐️ 1. (Added) Import new routes

// Config
const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join("./uploads"))); 

// CORS
const adminWhitelist = [
  "http://localhost:5173",
  "https://sut-park-a.vercel.app",
  "http://localhost:5174",
];

const adminCorsOptions = {
  origin: (origin, callback) => {
    if (adminWhitelist.indexOf(origin) !== -1 || !origin) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

const publicCorsOptions = {
  origin: "*",
  methods: "GET,POST,OPTIONS",
};

// --- Public Routes ---
app.get("/api/test", cors(publicCorsOptions), mainController.getApiTest);
app.get("/public/news", cors(publicCorsOptions), newsController.getPublicNews);
app.get("/public/activities", cors(publicCorsOptions), activityController.getPublicActivities);
app.get("/public/bookings", cors(publicCorsOptions), bookingController.getPublicBookings);
app.get("/public/services", cors(publicCorsOptions), serviceItemController.getPublicServiceItems);

app.post("/submit-form", cors(publicCorsOptions), contactController.createPublicContact);
app.post("/api/login", cors(publicCorsOptions), mainController.loginUser);

// File serving
app.use("/public/files", fileRoutes);

// --- Admin Protected Routes ---
app.use("/api/dashboard", cors(adminCorsOptions), authenticateToken, isAdmin, dashboardRoutes);
app.use("/api/news", cors(adminCorsOptions), authenticateToken, isAdmin, newsRoutes);
app.use("/api/activities", cors(adminCorsOptions), authenticateToken, isAdmin, activityRoutes);
app.use("/api/bookings", cors(adminCorsOptions), authenticateToken, isAdmin, bookingRoutes);
app.use("/api/contacts", cors(adminCorsOptions), authenticateToken, isAdmin, contactRoutes);
app.use("/api/documents", cors(adminCorsOptions), authenticateToken, isAdmin, documentRoutes);
app.use("/api/users", cors(adminCorsOptions), authenticateToken, isAdmin, userRoutes);
app.use("/api/services", cors(adminCorsOptions), authenticateToken, isAdmin, serviceItemRoutes);
app.use("/api/folders", cors(adminCorsOptions), authenticateToken, isAdmin, folderRoutes);

// ⭐️ 2. (Added) Activate the new routes (with security)
app.use("/api/trash", cors(adminCorsOptions), authenticateToken, isAdmin, trashRoutes);

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