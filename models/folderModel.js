// models/folderModel.js (แก้ไข - เพิ่ม Soft Delete)

import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder', 
    default: null, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // ⭐️⭐️⭐️ (เพิ่ม 2 ช่องนี้ครับ) ⭐️⭐️⭐️
  isDeleted: {
    type: Boolean,
    default: false,
    index: true // (เพิ่ม index ให้ค้นหาเร็วขึ้น)
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.model('Folder', folderSchema);