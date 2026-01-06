// controllers/userController.js (Corrected ESM)

// 1. เปลี่ยน 'require' ทั้งหมดเป็น 'import'
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// 2. ฟังก์ชันสร้าง User
export const createUser = async (req, res) => {
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

// 3. ฟังก์ชันดึง User ทั้งหมด
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// 4. ฟังก์ชันอัปเดต Role (Admin/User)
export const updateUserRole = async (req, res) => {
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

// 5. ฟังก์ชันเปลี่ยนรหัสผ่าน
export const changeUserPassword = async (req, res) => {
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

// 6. ฟังก์ชันลบ User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: `ลบผู้ใช้ ${deletedUser.username} สำเร็จ` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ⭐️⭐️ 7. (เพิ่มใหม่) ฟังก์ชันอัปเดตข้อมูลทั่วไป (Email, Phone, Username)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, phone } = req.body; // รับค่าที่ Frontend ส่งมา

        // อัปเดตข้อมูลลง Database
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, email, phone }, // แก้ไขฟิลด์เหล่านี้
            { new: true, runValidators: true } // คืนค่าใหม่กลับไป
        ).select('-password'); // ไม่ส่งรหัสผ่านกลับไป

        if (!updatedUser) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }

        res.json({ 
            status: 'success', 
            message: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ', 
            user: updatedUser 
        });

    } catch (error) {
        console.error('Error update user:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
};