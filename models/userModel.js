// models/userModel.js (Corrected ESM)

import mongoose from 'mongoose'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
import bcrypt from 'bcrypt';     // 2. ⭐️ (แก้ไข) เปลี่ยน 'require'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false } 
});

// (ย้าย Logic การ Hash รหัสผ่าน มาไว้ใน Model)
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { 
        this.password = await bcrypt.hash(this.password, 10); 
    }
    next();
});

export default mongoose.model('User', userSchema); // (บรรทัดนี้ถูกต้องแล้ว)