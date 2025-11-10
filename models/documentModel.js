// models/documentModel.js

const mongoose = require('mongoose');

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

module.exports = mongoose.model('Document', documentSchema);