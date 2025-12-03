import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String },
  folderId: { type: String, default: '0-0' },

  // ⭐️ ส่วน Soft Delete (ต้องเติม deletedBy)
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // 👈 เพิ่มบรรทัดนี้
}, 
{ timestamps: true });

export default mongoose.model('Document', documentSchema);