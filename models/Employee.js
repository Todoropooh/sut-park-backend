import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true }, // รหัสพนักงาน
  firstName: { type: String, required: true },  // ชื่อ (ไทย)
  lastName: { type: String, required: true },   // สกุล (ไทย)
  firstNameEn: { type: String, default: "" },   // Name (Eng) ⭐️ เพิ่มใหม่
  lastNameEn: { type: String, default: "" },    // Surname (Eng) ⭐️ เพิ่มใหม่
  position: { type: String, required: true },   // ตำแหน่ง
  phoneNumber: { type: String },                // โทรศัพท์เคลื่อนที่
  
  // ฟิลด์เสริม (เก็บไว้เผื่อใช้ แต่ไม่ได้โชว์ในตารางหลักตามคำขอ)
  email: { type: String },
  birthDate: { type: Date },
  idCardNumber: { type: String },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);