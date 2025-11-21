import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  
  // ข้อมูลเพิ่มเติม
  category: { type: String, default: 'ทั่วไป' }, // หมวดหมู่
  link: { type: String },                        // ลิงก์ภายนอก
  startDate: { type: Date },                     // วันเริ่ม
  endDate: { type: Date },                       // วันจบ
  rewardAmount: { type: Number, default: 0 },    // เงินรางวัล

  // ⭐️ [เพิ่ม] ฟิลด์สำหรับ Soft Delete (ถังขยะ)
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ServiceItem", serviceItemSchema);