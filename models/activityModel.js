// models/activityModel.js

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  
  // ⭐️ [เพิ่ม] รองรับวันเริ่ม-วันจบ
  date: { type: Date },       // (เก็บไว้รองรับข้อมูลเก่า)
  startDate: { type: Date },  // วันเริ่ม (Field ใหม่)
  endDate: { type: Date },    // วันจบ (Field ใหม่)

  // ⭐️ Soft Delete
  isDeleted: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  }
},
{
  timestamps: true 
});

export default mongoose.model("Activity", activitySchema);