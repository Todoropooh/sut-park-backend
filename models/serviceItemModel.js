// models/serviceItemModel.js

const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // ⭐️ "หัวข้อใหญ่" (Category)
  category: { 
    type: String, 
    required: true, 
    // (เราจะใช้ค่าจากเมนู dropdown)
    enum: ['สร้าง STARTUP', 'ส่งเสริม SME', 'สนับสนุนวิสาหกิจชุมชน', 'เพิ่มศักยภาพ ENTERPRISE', 'มุ่งสู่ GLOBAL', 'อื่นๆ']
  },
  
  // ⭐️ "ย่อยลงไป" (Fields)
  fundingAmount: { type: Number, default: 0 },
  targetAudience: [{ type: String }], // ⭐️ (เก็บเป็น Array)
  deadline: { type: Date },
  imageUrl: { type: String }, // ⭐️ (สำหรับโปสเตอร์)

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceItem', serviceItemSchema);