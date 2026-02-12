import express from 'express';
const router = express.Router();

import * as userController from '../controllers/userController.js';


// ==========================
// USER MANAGEMENT ROUTES
// base: /api/users
// ==========================


// ➕ สร้างผู้ใช้ใหม่
router.post('/create', userController.createUser);


// 📄 ดึงผู้ใช้ทั้งหมด (ไม่รวมที่ soft delete)
router.get('/', userController.getAllUsers);


// ✏️ แก้ไขข้อมูลโปรไฟล์ทั่วไป
// PUT /api/users/:id
router.put('/:id', userController.updateUser);


// 🛡 เปลี่ยนสิทธิ์ Admin / User
router.put('/:id/update-role', userController.updateUserRole);


// 🔐 เปลี่ยนรหัสผ่าน
router.put('/:id/change-password', userController.changeUserPassword);


// 🗑 Soft Delete ผู้ใช้
router.delete('/:id', userController.deleteUser);


export default router;
