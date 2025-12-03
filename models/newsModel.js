import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String }, 
  content: { type: String, required: true },
  imageUrl: { type: String }, 
  publishedAt: { type: Date, default: Date.now },

  // วันเริ่ม-จบ
  startDate: { type: Date }, 
  endDate: { type: Date },

  // ⭐️ ส่วน Soft Delete (เพิ่ม deletedBy แล้ว)
  isDeleted: { 
    type: Boolean, 
    default: false,
    index: true
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  // 👇 ต้องเพิ่มบรรทัดนี้ครับ ไม่งั้นหาคนลบไม่เจอ
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
}, 
{
  timestamps: true 
});

export default mongoose.model('News', newsSchema);