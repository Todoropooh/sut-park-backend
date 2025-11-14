// models/contactModel.js (Corrected ESM)

import mongoose from 'mongoose'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'

const contactSchema = new mongoose.Schema({ 
    name: { type: String, required: true }, 
    email: { type: String, required: true }, 
    message: { type: String }, 
    submittedAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false } 
});

// 2. ⭐️ (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default mongoose.model('Contact', contactSchema);