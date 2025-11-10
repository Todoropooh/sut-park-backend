// controllers/documentController.js

const Document = require('../models/documentModel'); // (เราจะสร้างไฟล์นี้)
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// (ย้ายมาจาก POST /api/documents/upload)
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
        }
        
        // ⭐️ (แก้ไข) ดึง category
        const { description, category } = req.body;
        const { originalname, filename } = req.file;

        const fileUrlPath = `/uploads/documents/${filename}`;
        
        const newDocument = new Document({
            originalFilename: Buffer.from(originalname, 'latin1').toString('utf8'), 
            storedFilename: filename,
            path: fileUrlPath, 
            description: description || 'ไม่มีคำอธิบาย',
            category: category || 'ทั่วไป' // ⭐️ (เพิ่ม)
        });

        await newDocument.save();
        res.status(201).json({ 
            status: 'success',
            message: 'อัปโหลดไฟล์และบันทึกข้อมูลสำเร็จ!', 
            document: newDocument 
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปโหลดเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// (ย้ายมาจาก GET /api/documents)
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().sort({ uploadedAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// (ย้ายมาจาก DELETE /api/documents/:id)
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
        }

        // ⭐️ (สำคัญ) แก้ Path
        const filePath = path.join(__dirname, '../uploads/documents', document.storedFilename); 

        fs.unlink(filePath, async (err) => {
            if (err) {
                console.warn(`ไม่สามารถลบไฟล์ได้ (อาจถูกลบไปแล้ว): ${filePath}`, err.message);
            }
            await Document.findByIdAndDelete(id);
            res.json({ status: 'success', message: 'ลบเอกสารเรียบร้อยแล้ว' });
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// (ย้ายมาจาก GET /api/documents/:id/download)
exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
        }

        // ⭐️ (สำคัญ) แก้ Path
        const filePath = path.join(__dirname, '../', document.path.substring(1)); 

        if (fs.existsSync(filePath)) {
            res.download(filePath, document.originalFilename, (err) => {
                if (err) {
                    console.error('เกิดข้อผิดพลาดระหว่างส่งไฟล์ดาวน์โหลด:', err.message);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์' });
                    }
                }
            });
        } else {
            console.warn(`ไม่พบไฟล์บนเซิร์ฟเวอร์: ${filePath}`);
            return res.status(404).json({ message: 'ไม่พบไฟล์บนเซิร์ฟเวอร์ (อาจถูกลบไปแล้ว)' });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};