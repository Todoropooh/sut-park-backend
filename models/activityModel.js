import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  
  // รองรับวันเริ่ม-วันจบ
  date: { type: Date },       // (เก็บไว้รองรับข้อมูลเก่า)
  startDate: { type: Date },  // วันเริ่ม
  endDate: { type: Date },    // วันจบ

  // ⭐️ Soft Delete (เพิ่ม deletedBy แล้ว)
  isDeleted: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  // 👇 ต้องเพิ่มบรรทัดนี้เช่นกันครับ
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
},
{
  timestamps: true 
});

export default mongoose.model("Activity", activitySchema);