// controllers/mainController.js

const User = require('../models/userModel'); // (เราจะสร้างไฟล์นี้ในขั้นตอนต่อไป)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!'; 

// (ย้ายมาจาก GET /api/test)
exports.getApiTest = (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'SUT Park Backend is running correctly!',
        timestamp: new Date().toISOString() 
    });
};

// (ย้ายมาจาก POST /api/login)
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) { return res.status(400).json({ message: 'กรุณากรอก Username และ Password' }); }
        const user = await User.findOne({ username: username });
        if (!user) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        const payload = { userId: user._id, username: user.username, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); 
        res.json({ status: 'success', message: 'ล็อกอินสำเร็จ', token: token, user: { username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error('Error /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};