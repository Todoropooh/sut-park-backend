// models/documentModel.js (แก้ไขแล้ว)

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalFilename: { 
    type: String, 
    required: true 
  },
  storedFilename: { 
    type: String, 
    required: true, 
    unique: true 
  },
  path: { // (Path ที่เราใช้ใน Multer /uploads/documents/...)
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  },
  
  // ⭐️ (ลบ) 'category' ถูกลบออก
  
  // ⭐️ (เพิ่ม) 'folderId'
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder', // ⭐️ ชี้ไปที่ Model 'Folder'
    default: null, // ⭐️ ถ้าเป็น null = อยู่ Root
  },
  
  // ⭐️ (เพิ่ม) 'size' (ตาม Requirement ข้อ 5)
  size: {
    type: Number,
    default: 0
  },

  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Document', documentSchema);