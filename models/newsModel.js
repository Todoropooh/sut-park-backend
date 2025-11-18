// models/newsModel.js (Updated for Trash Bin)

import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, 
    content: { type: String, required: true },
    imageUrl: { type: String }, 
    publishedAt: { type: Date, default: Date.now },

  // --- 👇 [เพิ่มส่วนนี้] ---
    isDeleted: { 
    type: Boolean, 
    default: false,
    index: true // (เพิ่ม index ช่วยให้ค้นหาเร็วขึ้น)
    },
    deletedAt: { 
    type: Date, 
    default: null 
    }
  // --- 👆 [สิ้นสุดส่วนที่เพิ่ม] ---
}, 
{
  // 👇 [เพิ่มส่วนนี้]
  // (เพิ่มฟิลด์ createdAt และ updatedAt ให้อัตโนมัติ)
    timestamps: true 
});

export default mongoose.model('News', newsSchema);