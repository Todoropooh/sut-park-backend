// models/serviceItemModel.js (แก้ไขแล้ว)

import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetAudience: [String],
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  
  // ⭐️⭐️⭐️ (เพิ่ม 2 บรรทัดนี้ครับ) ⭐️⭐️⭐️
  startDate: { type: Date, default: null }, // วันที่เริ่ม
  linkUrl: { type: String, default: null }  // ลิงก์
});

export default mongoose.model("ServiceItem", serviceItemSchema);