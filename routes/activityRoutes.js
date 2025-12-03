// src/routes/activityRoutes.js

import express from 'express';
import { 
    getPublicActivities, 
    getAllActivities, 
    getActivityById, 
    createActivity, 
    updateActivity, 
    deleteActivity 
} from '../controllers/activityController.js';

// 🟢 Import Auth Middleware
import { authenticateToken } from '../middleware/authMiddleware.js'; 

// 🟢 Import Upload Middleware (ใช้ตัวเดียวกับ News)
// ต้องใช้ { upload } เพราะเรา export const มา ไม่ใช่ export default
import { upload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- Public ---
router.get('/public', getPublicActivities);
router.get('/:id', getActivityById);

// --- Protected ---
router.get('/', authenticateToken, getAllActivities);

// สร้างกิจกรรม (อัปโหลดรูป)
router.post('/', authenticateToken, upload.single('image'), createActivity);

// แก้ไขกิจกรรม (อัปโหลดรูป)
router.put('/:id', authenticateToken, upload.single('image'), updateActivity);

// ลบกิจกรรม (Soft Delete)
router.delete('/:id', authenticateToken, deleteActivity);

export default router;