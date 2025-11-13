import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  fundingAmount: { type: Number, default: 0 },
  targetAudience: [String],
  deadline: Date,
  imageUrl: String, // ใช้ URL จาก Cloudinary
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
