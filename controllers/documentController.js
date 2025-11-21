// controllers/documentController.js

import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. ⭐️ [ต้องมี] Upload Documents (Multiple Files) ---
export const uploadDocument = async (req, res) => {
  try {
    // ตรวจสอบว่ามีไฟล์ส่งมาไหม
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์" });
    }

    const { folderId } = req.body;
    // แปลง folderId: ถ้าเป็น '0-0' หรือไม่มี ให้เป็น null (Root)
    const parentFolderId = (folderId === '0-0' || !folderId) ? null : folderId;

    const savedDocuments = [];

    for (const file of req.files) {
      const relativePath = `/${file.path.replace(/\\/g, "/")}`;

      // แปลงชื่อไฟล์ต้นฉบับเป็น UTF-8 (แก้ปัญหาภาษาไทย)
      const safeOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const newDoc = new Document({
        originalFilename: safeOriginalName,
        storedFilename: file.filename,
        fileType: file.mimetype,
        size: file.size,
        path: relativePath,
        folderId: parentFolderId,
        owner: req.user ? req.user.id : null,
        isDeleted: false,
        deletedAt: null
      });

      await newDoc.save();
      savedDocuments.push(newDoc);
    }

    res.status(201).json({ 
      message: `อัปโหลดสำเร็จ ${savedDocuments.length} ไฟล์`, 
      documents: savedDocuments 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลด" });
  }
};

// --- 2. Delete Document (Soft Delete) ---
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedDoc = await Document.findByIdAndUpdate(
      id,
      {
        isDeleted: true,        // ปักธงว่าลบแล้ว
        deletedAt: new Date()   // ลงเวลาที่ลบ
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "ไม่พบไฟล์" });
    }

    res.json({ message: "ย้ายไฟล์ไปถังขยะแล้ว" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบไฟล์" });
  }
};

// --- 3. Get All Documents (Active Only) ---
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. Download Document ---
export const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findById(id); 
        if (!doc) return res.status(404).json({ message: "ไม่พบไฟล์" });

        const relativePath = doc.path.startsWith('/') ? doc.path.substring(1) : doc.path;
        const filePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(filePath)) {
            res.download(filePath, doc.originalFilename);
        } else {
            res.status(404).json({ message: "ไฟล์ต้นฉบับหายไปจาก Server" });
        }
    } catch (error) {
        res.status(500).json({ message: "ดาวน์โหลดล้มเหลว" });
    }
};