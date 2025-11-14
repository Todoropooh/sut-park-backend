// routes/activityRoutes.js
import express from "express";
import multer from "multer";
import * as activityController from "../controllers/activityController.js";

const router = express.Router();

// Multer storage (local upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Public
router.get("/public", activityController.getPublicActivities);

// Admin / Protected
router.get("/", activityController.getAllActivities);
router.get("/:id", activityController.getActivityById);
router.post("/", upload.single("image"), activityController.createActivity);
router.put("/:id", upload.single("image"), activityController.updateActivity);
router.delete("/:id", activityController.deleteActivity);

export default router;
