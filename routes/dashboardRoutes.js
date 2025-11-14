// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

// 1. ⭐️ (สำคัญ) นำเข้า "สมอง" (Controller) ของ Dashboard
const dashboardController = require('../controllers/dashboardController');

// (Path '/' ที่นี่ จะหมายถึง '/api/dashboard' 
//  เพราะเราตั้งค่าไว้ใน server.js)

// 2. ⭐️ (สำคัญ) Path จริงคือ /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats); 

export default router;