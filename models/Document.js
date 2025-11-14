const mongoose = require('mongoose');

// สร้าง "พิมพ์เขียว" (Schema)
const documentSchema = new mongoose.Schema({
    originalFilename: { 
        type: String, 
        required: true 
    },
    storedFilename: { // ชื่อไฟล์ที่เก็บจริงบนเซิร์ฟเวอร์
        type: String, 
        required: true, 
        unique: true 
    },
    path: { // URL path ที่จะใช้ดาวน์โหลด
        type: String, 
        required: true 
    },
    description: { // คำอธิบายไฟล์
        type: String, 
        required: false 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// สร้าง "Model" จาก Schema แล้วส่งออกไปให้ไฟล์อื่นใช้
export default mongoose.model('Document', documentSchema);