// routes/serviceItemRoutes.js

import express from "express";
import uploadCloud from "../middleware/uploadCloudinary.js"; // ⭐️ เรียกใช้ตัวอัปโหลด Cloudinary
import * as serviceItemController from "../controllers/serviceItemController.js";

const router = express.Router();

// Get
router.get("/", serviceItemController.getServiceItems);
router.get("/public", serviceItemController.getPublicServiceItems);

// Create & Update (เปลี่ยน middleware ตรงกลางเป็น uploadCloud)
router.post("/", uploadCloud.single("image"), serviceItemController.createServiceItem);
router.put("/:id", uploadCloud.single("image"), serviceItemController.updateServiceItem);

// Delete
router.delete("/:id", serviceItemController.deleteServiceItem);

export default router;