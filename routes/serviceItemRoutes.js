import express from "express";
import multer from "multer";
import * as serviceItemController from "../controllers/serviceItemController.js";

const router = express.Router();

// Multer storage (local upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/services");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/", serviceItemController.getServiceItems);
router.get("/public", serviceItemController.getPublicServiceItems);

router.post("/", upload.single("image"), serviceItemController.createServiceItem);
router.put("/:id", upload.single("image"), serviceItemController.updateServiceItem);
router.delete("/:id", serviceItemController.deleteServiceItem);

export default router;
