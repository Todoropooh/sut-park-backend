// src/routes/serviceItemRoutes.js

import express from 'express';
import {
  getServiceItems,
  getServiceItemById,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem
} from '../controllers/serviceItemController.js';

import { authenticateToken } from '../middleware/authMiddleware.js'; 

// 🟢 กลับมาใช้แบบเดิม (Named Import)
import { upload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

router.get('/', getServiceItems);
router.get('/:id', getServiceItemById);

router.post('/', authenticateToken, upload.single('image'), createServiceItem);
router.put('/:id', authenticateToken, upload.single('image'), updateServiceItem);
router.delete('/:id', authenticateToken, deleteServiceItem);

export default router;  