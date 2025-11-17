// controllers/documentController.js (แก้ไขแล้ว)

import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// (Fix __dirname ที่เราเคยทำ)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

// --- 1. ⭐️ (แก้ไข) อัปเดตฟังก์ชัน Upload ---
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
    }
    
    // ⭐️ 1.1 ดึง 'folderId' จาก req.body (ที่ส่งมาจากฟอร์ม)
    const { description, folderId } = req.body;
    const { originalname, filename, size } = req.file;

    const fileUrlPath = `/uploads/documents/${filename}`;
    
    const newDocument = new Document({
      originalFilename: Buffer.from(originalname, 'latin1').toString('utf8'), 
      storedFilename: filename,
      path: fileUrlPath, 
      description: description || 'ไม่มีคำอธิบาย',
      
      // ⭐️ 1.2 เพิ่ม folderId และ size
      folderId: folderId || null, // (ถ้าไม่ส่งมา = อยู่ Root)
      size: size || 0,
      
      // (ลบ 'category' ออก)
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

// --- (ฟังก์ชันที่เหลือ - เหมือนเดิม แต่ตรวจสอบ Path) ---

export const getAllDocuments = async (req, res) => {
  try {
    // (หมายเหตุ: ฟังก์ชันนี้จะไม่ได้ใช้ในระบบใหม่
    //  เพราะเราจะใช้ 'getContents' จาก folderController แทน)
    const documents = await Document.find().sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDocument = async (req, res) => {
  // (หมายเหตุ: ฟังก์ชันนี้จะไม่ได้ใช้ในระบบใหม่
  //  เพราะเราจะใช้ 'deleteItem' จาก folderController แทน
  //  แต่เรายังเก็บไว้เผื่อใช้)
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
    }

    // ⭐️ (ตรวจสอบ) Path นี้ถูกต้อง (เพราะเราแก้ __dirname แล้ว)
    const filePath = path.join(__dirname, '../', document.path.substring(1)); 

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // (เปลี่ยนเป็น Sync เพื่อง่ายต่อการจัดการ)
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

    // ⭐️ (ตรวจสอบ) Path นี้ถูกต้อง (เพราะเราแก้ __dirname แล้ว)
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