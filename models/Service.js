import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  fundingAmount: { type: Number, default: 0 },
  
  // 🟢 เพิ่มฟิลด์กลุ่มเป้าหมาย (Target Group)
  targetGroup: { 
    type: String, 
    required: true,
    enum: ['นักเรียน/นักศึกษา', 'อาจารย์', 'นักวิจัย', 'ทุกประเภท'],
    default: 'ทุกประเภท' 
  },

  targetAudience: [String], // ยังคงไว้ตามโค้ดเดิมของแจ้ม
  deadline: Date,
  imageUrl: String, // ใช้ URL จาก Cloudinary
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);