import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  firstNameEn: { type: String, default: "" },
  lastNameEn: { type: String, default: "" },
  position: { type: String, required: true },
  
  // ⭐️ ฟิลด์สำคัญ: หน่วยงาน
  division: { type: String, default: "" }, 

  phoneNumber: { type: String },
  email: { type: String },
  birthDate: { type: Date },
  idCardNumber: { type: String },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);