// controllers/documentController.js (แก้ไข Typo แล้ว)

import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// (Fix __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // ⭐️ (แก้ไข) นี่คือบรรทัดที่แก้ครับ

// --- 1. (แก้ไข) อัปเดตฟังก์ชัน Upload ---
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
    }
    
    const { description, folderId } = req.body;
    const { originalname, filename, size } = req.file;

    const fileUrlPath = `/uploads/documents/${filename}`;
    
    const newDocument = new Document({
      originalFilename: Buffer.from(originalname, 'latin1').toString('utf8'), 
      storedFilename: filename,
      path: fileUrlPath, 
      description: description || 'ไม่มีคำอธิบาย',
      folderId: folderId || null, 
      size: size || 0,
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

// --- (ฟังก์ชันที่เหลือ - เหมือนเดิม) ---

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

    const filePath = path.join(__dirname, '../', document.path.substring(1)); 

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    } else {
      console.warn(`ไม่สามารถลบไฟล์ได้ (ไม่พบ): ${filePath}`);
    }
    
    await Document.findByIdAndDelete(id);
    res.json({ status: 'success', message: 'ลบเอกสารเรียบร้อยแล้ว' });

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

    const filePath = path.join(__dirname, '../', document.path.substring(1)); 

    if (fs.existsSync(filePath)) {
      res.download(filePath, document.originalFilename, (err) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดระหว่างส่งไฟล์ดาวน์โหลด:', err.message);
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