// models/folderModel.js (ไฟล์ใหม่)

import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // ⭐️ นี่คือหัวใจของระบบ (Recursive)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder', // ⭐️ ชี้กลับไปที่ Model 'Folder' (ตัวมันเอง)
    default: null, // ⭐️ ถ้าเป็น null = อยู่ Root
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Folder', folderSchema);