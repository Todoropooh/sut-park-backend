// routes/userRoutes.js

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// (Path '/' ที่นี่ หมายถึง '/api/users')
// (หน้านี้ไม่ต้องใช้ 'upload' เพราะจัดการแค่ Text)

router.post('/create', userController.createUser);
router.get('/', userController.getAllUsers);
router.put('/:id/update-role', userController.updateUserRole);
router.put('/:id/change-password', userController.changeUserPassword);
router.delete('/:id', userController.deleteUser);

export default router;