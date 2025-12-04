import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  firstNameEn: String,
  lastNameEn: String,
  
  // ข้อมูลตำแหน่ง
  position: String,
  division: String,

  // 🟢 [เพิ่ม] ช่องเก็บข้อมูลติดต่อ
  email: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },

  // 🟢 [เพิ่ม] ช่องเก็บ URL รูปภาพ
  imageUrl: { type: String, default: "" },

  // ⭐️ ส่วน Soft Delete
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, 
{ 
  timestamps: true 
});

export default mongoose.model('Employee', employeeSchema);