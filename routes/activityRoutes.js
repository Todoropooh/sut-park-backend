// routes/activityRoutes.js

import express from 'express';
import uploadCloud from '../middleware/uploadCloudinary.js'; // ⭐️ ใช้ Cloudinary
import * as activityController from '../controllers/activityController.js';

const router = express.Router();

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);

// Create & Update (Frontend ส่ง field ชื่อ 'image')
router.post('/', uploadCloud.single('image'), activityController.createActivity);
router.put('/:id', uploadCloud.single('image'), activityController.updateActivity);

// Delete
router.delete('/:id', activityController.deleteActivity);

export default router;