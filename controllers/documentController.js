// controllers/documentController.js (Corrected ESM)

// 1. ⭐️ (แก้ไข) เปลี่ยน 'require' ทั้งหมดเป็น 'import'
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url'; // ⭐️ (เพิ่ม) สำหรับแก้ __dirname

// 2. ⭐️ (เพิ่ม) Fix __dirname ที่ไม่รองรับใน ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. ⭐️ (แก้ไข) เปลี่ยน 'exports.uploadDocument' เป็น 'export const ...'
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
        }
        
        const { description, category } = req.body;
        const { originalname, filename } = req.file;

        // ⭐️ (สำคัญ) ต้องมั่นใจว่า path.join ของคุณใน server.js
        // ชี้ไปที่ 'public/uploads/documents' หรือ 'uploads/documents' จริงๆ
        // แต่โค้ดนี้สร้าง path ถูกต้องแล้ว
        const fileUrlPath = `/uploads/documents/${filename}`; 
        
        const newDocument = new Document({
            originalFilename: Buffer.from(originalname, 'latin1').toString('utf8'), 
            storedFilename: filename,
            path: fileUrlPath, 
            description: description || 'ไม่มีคำอธิบาย',
            category: category || 'ทั่วไป'
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

// 4. ⭐️ (แก้ไข) เพิ่ม 'export const' หน้าฟังก์ชันที่เหลือ
export const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().sort({ uploadedAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
        }

        // ⭐️ (สำคัญ) Path นี้จะทำงานได้เพราะเราแก้ __dirname แล้ว
        // และต้องแน่ใจว่าโฟลเดอร์ uploads ของคุณอยู่ที่ root ไม่ได้อยู่ใน public
        // ถ้าอยู่ใน public/uploads path ต้องเป็น path.join(__dirname, '../public/uploads/documents', ...)
        const filePath = path.join(__dirname, '../uploads/documents', document.storedFilename); 

        fs.unlink(filePath, async (err) => {
            if (err) {
                console.warn(`ไม่สามารถลบไฟล์ได้ (อาจถูกลบไปแล้ว): ${filePath}`, err.message);
            }
            // แม้ลบไฟล์ไม่สำเร็จ ก็ยังลบข้อมูลใน DB
            await Document.findByIdAndDelete(id);
            res.json({ status: 'success', message: 'ลบเอกสารเรียบร้อยแล้ว' });
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
        }

        // ⭐️ (สำคัญ) แก้ Path ให้ตรงกับโครงสร้าง
        // document.path คือ '/uploads/documents/file.pdf'
        // เราจึงต้องถอย 1 ที (../) แล้วเอา / ออก (substring(1))
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

// (ไม่ต้องมี module.exports อีกต่อไป)