// models/documentModel.js (Corrected ESM)

import mongoose from 'mongoose'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'

// (นี่คือ Schema ที่อัปเดตล่าสุด ที่มี 'category')
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
    path: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: false 
    },
    category: { 
        type: String, 
        required: false, 
        default: 'ทั่วไป' 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model('Document', documentSchema); // (บรรทัดนี้ถูกต้องแล้ว)