// routes/userRoutes.js (Corrected ESM)

import express from 'express'; 
const router = express.Router();

// import controller เข้ามา
import * as userController from '../controllers/userController.js';

// (Path '/' ที่นี่ หมายถึง '/api/users')

// Route สร้าง User ใหม่
router.post('/create', userController.createUser);

// Route ดึง User ทั้งหมด
router.get('/', userController.getAllUsers);

// ⭐️⭐️ (เพิ่มใหม่) Route แก้ไขข้อมูลทั่วไป (Email, Phone, Username) ⭐️⭐️
// รองรับการยิงมาที่ PUT /api/users/:id
router.put('/:id', userController.updateUser);

// Route แก้ไขสิทธิ์ (Admin/User)
router.put('/:id/update-role', userController.updateUserRole);

// Route เปลี่ยนรหัสผ่าน
router.put('/:id/change-password', userController.changeUserPassword);

// Route ลบ User
router.delete('/:id', userController.deleteUser);

export default router;