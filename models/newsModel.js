// models/newsModel.js (Corrected)

import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, 
    content: { type: String, required: true },
    imageUrl: { type: String }, 
    publishedAt: { type: Date, default: Date.now }
});

// เปลี่ยนจาก module.exports เป็น export default ครับ
export default mongoose.model('News', newsSchema);