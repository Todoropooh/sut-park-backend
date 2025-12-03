import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: String, default: '0-0' }, // '0-0' คือ Root
  path: { type: Array, default: [] },
  
  // ⭐️ ส่วน Soft Delete (ต้องเติม deletedBy)
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // 👈 เพิ่มบรรทัดนี้
}, 
{ timestamps: true });

export default mongoose.model('Folder', folderSchema);