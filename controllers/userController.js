// controllers/userController.js

const User = require('../models/userModel'); // (เราจะสร้างไฟล์นี้)
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// (ย้ายมาจาก POST /api/users/create)
exports.createUser = async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        if (!username || !password) { return res.status(400).json({ message: 'กรุณากรอก Username และ Password' }); }
        const existingUser = await User.findOne({ username });
        if (existingUser) { return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' }); }
        const newUser = new User({ username, password, isAdmin: isAdmin || false });
        await newUser.save();
        res.status(201).json({ status: 'success', message: `สร้างผู้ใช้ ${username} สำเร็จ` });
    } catch (error) {
        console.error('Error /api/users/create:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// (ย้ายมาจาก GET /api/users)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก PUT /api/users/:id/update-role)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;
        if (typeof isAdmin !== 'boolean') { return res.status(400).json({ message: 'รูปแบบข้อมูลสิทธิ์ไม่ถูกต้อง' }); }
        const updatedUser = await User.findByIdAndUpdate( id, { isAdmin }, { new: true } ).select('-password');
        if (!updatedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: `อัปเดตสิทธิ์ผู้ใช้ ${updatedUser.username} เป็น ${isAdmin ? 'Admin' : 'User'} สำเร็จ`, user: updatedUser });
    } catch (error) {
        console.error('Error /api/users/:id/update-role PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์' });
    }
};

// (ย้ายมาจาก PUT /api/users/:id/change-password)
exports.changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) { return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านใหม่ที่มีอย่างน้อย 6 ตัวอักษร' }); }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate( id, { password: hashedPassword }, { new: true } ).select('-password');
        if (!updatedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
        console.error('Error /api/users/:id/change-password PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    }
};

// (ย้ายมาจาก DELETE /api/users/:id)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: `ลบผู้ใช้ ${deletedUser.username} สำเร็จ` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};