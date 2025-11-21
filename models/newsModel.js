import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String }, 
  content: { type: String, required: true },
  imageUrl: { type: String }, 
  publishedAt: { type: Date, default: Date.now },

  // ⭐️ ส่วนที่เพิ่มใหม่ (วันเริ่ม-จบ)
  startDate: { type: Date }, 
  endDate: { type: Date },

  // ⭐️ ส่วน Soft Delete
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

export default mongoose.model('News', newsSchema);