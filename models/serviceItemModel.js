// src/models/serviceModel.js

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  
  // ข้อมูลเพิ่มเติม
  category: { type: String, default: 'ทั่วไป' },
  
  // 🟢 เพิ่มส่วนนี้: กลุ่มเป้าหมาย (ล็อกค่า enum ตามโจทย์เป๊ะ)
  targetGroup: { 
    type: String, 
    required: true,
    enum: ['นักเรียน/นักศึกษา', 'อาจารย์', 'นักวิจัย', 'ทุกประเภท'],
    default: 'ทุกประเภท' 
  },

  link: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  rewardAmount: { type: Number, default: 0 },

  // ⭐️ ส่วน Soft Delete (รักษาไว้ครบ 3 ตัวตามของเดิม)
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
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