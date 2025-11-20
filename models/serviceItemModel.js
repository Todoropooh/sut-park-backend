import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  
  // ⭐️ ฟิลด์ใหม่ที่เพิ่มเข้ามา
  category: { type: String, default: 'ทั่วไป' }, // หมวดหมู่
  link: { type: String },                        // ลิงก์ภายนอก
  startDate: { type: Date },                     // วันเริ่ม
  endDate: { type: Date },                       // วันจบ
  rewardAmount: { type: Number, default: 0 },    // เงินรางวัล

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ServiceItem", serviceItemSchema);