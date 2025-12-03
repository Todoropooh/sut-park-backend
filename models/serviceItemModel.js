// src/models/serviceModel.js

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  
  // ข้อมูลเพิ่มเติม
  category: { type: String, default: 'ทั่วไป' },
  link: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  rewardAmount: { type: Number, default: 0 },

  // ⭐️ ส่วน Soft Delete (ต้องมีครบ 3 ตัวนี้ เพื่อให้ระบบถังขยะทำงานสมบูรณ์)
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true // ใส่ index เพื่อให้ค้นหาเร็วขึ้น
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  // 👇 ตัวสำคัญที่ขาดไป! ต้องมีเพื่อเก็บว่า User คนไหนเป็นคนลบ
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },

  createdAt: { type: Date, default: Date.now },
}, 
{ 
  timestamps: true 
});

export default mongoose.model("Service", serviceSchema);