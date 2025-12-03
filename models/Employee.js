// models/employee.js

import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  firstNameEn: String,
  lastNameEn: String,
  position: String,
  division: String,
  email: String,
  phoneNumber: String,
  imageUrl: String,

  // ⭐️ ส่วน Soft Delete (ต้องมีครบ 3 ตัวนี้)
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  // 👇 ตัวสำคัญที่ขาดไม่ได้ สำหรับโชว์ในหน้าถังขยะ
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
}, 
{ 
  timestamps: true 
});

export default mongoose.model('Employee', employeeSchema);