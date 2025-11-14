// routes/userRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as userController from '../controllers/userController.js';

// (Path '/' ที่นี่ หมายถึง '/api/users')
// (หน้านี้ไม่ต้องใช้ 'upload' เพราะจัดการแค่ Text)

router.post('/create', userController.createUser);
router.get('/', userController.getAllUsers);
router.put('/:id/update-role', userController.updateUserRole);
router.put('/:id/change-password', userController.changeUserPassword);
router.delete('/:id', userController.deleteUser);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)