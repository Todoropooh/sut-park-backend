import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,        // ชื่อไฟล์ต้นฉบับ
  url: String,             // URL จาก Cloudinary
  uploadedAt: { type: Date, default: Date.now } // เวลาที่อัปโหลด
});

 const File = mongoose.model('File', fileSchema);

export default File;