// routes/dashboardRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as dashboardController from '../controllers/dashboardController.js';

// (Path '/' ที่นี่ จะหมายถึง '/api/dashboard' 
//  เพราะเราตั้งค่าไว้ใน server.js)

// 3. ⭐️ Path จริงคือ /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats); 

export default router; // (บรรทัดนี้ถูกต้องแล้ว)