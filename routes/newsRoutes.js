// routes/newsRoutes.js

import express from "express";
import uploadCloud from "../middleware/uploadCloudinary.js"; // ⭐️ ใช้ Cloudinary
import * as newsController from "../controllers/newsController.js";

const router = express.Router();

// Get
router.get("/", newsController.getAllNews);
router.get("/public", newsController.getPublicNews);

// Create & Update
// ⭐️ Frontend ส่งมาชื่อ fieldว่า 'imageUrl' (ต้องตรงกัน)
router.post("/", uploadCloud.single("imageUrl"), newsController.createNews);
router.put("/:id", uploadCloud.single("imageUrl"), newsController.updateNews);

// Delete
router.delete("/:id", newsController.deleteNews);

// Get by ID
router.get("/:id", newsController.getNewsById);

export default router;