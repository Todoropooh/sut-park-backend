// controllers/mainController.js (Corrected ESM)

// 1. ⭐️ (แก้ไข) เปลี่ยน 'require' ทั้งหมดเป็น 'import'
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!'; 

// 2. ⭐️ (แก้ไข) เปลี่ยน 'exports.getApiTest' เป็น 'export const ...'
export const getApiTest = (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'SUT Park Backend is running correctly!',
        timestamp: new Date().toISOString() 
    });
};

// 3. ⭐️ (แก้ไข) เปลี่ยน 'exports.loginUser' เป็น 'export const ...'
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) { return res.status(400).json({ message: 'กรุณากรอก Username และ Password' }); }
        
        const user = await User.findOne({ username: username });
        if (!user) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        
        const payload = { userId: user._id, username: user.username, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); 
        
        // ⭐️⭐️ แก้ตรงนี้ครับ: เพิ่ม _id: user._id เข้าไปใน object user
        res.json({ 
            status: 'success', 
            message: 'ล็อกอินสำเร็จ', 
            token: token, 
            user: { 
                _id: user._id,       // <--- เพิ่มบรรทัดนี้ครับ! สำคัญมาก
                username: user.username, 
                isAdmin: user.isAdmin 
            } 
        });

    } catch (error) {
        console.error('Error /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// (ไม่ต้องมี module.exports อีกต่อไป)