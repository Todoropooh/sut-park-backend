// controllers/documentController.js

import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Upload Documents (รองรับ Multiple Files) ---
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

    // วนลูปไฟล์ทั้งหมดที่ส่งมา
    for (const file of req.files) {
      // สร้าง Path สำหรับเก็บใน DB (ตัดส่วน Local path ออกให้เหลือ /uploads/...)
      // Windows path fix: replace backslashes
      const relativePath = `/${file.path.replace(/\\/g, "/")}`;

      const newDoc = new Document({
        originalFilename: file.originalname,
        storedFilename: file.filename,
        fileType: file.mimetype,
        size: file.size,
        path: relativePath,
        folderId: parentFolderId, // เชื่อมกับ Folder
        owner: req.user ? req.user.id : null, // ถ้ามี Auth
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

// --- 2. Delete Document ---
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ message: "ไม่พบไฟล์" });
    }

    // ลบไฟล์จริง (ถ้ามี)
    // Path ใน DB: /uploads/documents/file.jpg -> Path จริง: C:/project/uploads/documents/file.jpg
    if (doc.path) {
       // ตัด / ตัวแรกออกเพื่อให้ path.join ทำงานถูกกับ process.cwd()
       const relativePath = doc.path.startsWith('/') ? doc.path.substring(1) : doc.path;
       const absolutePath = path.join(process.cwd(), relativePath);

       if (fs.existsSync(absolutePath)) {
         fs.unlinkSync(absolutePath);
       }
    }

    // ลบข้อมูลใน DB (หรือใช้ Soft Delete ตามระบบ Trash ที่เราทำไว้ก็ได้)
    // ถ้าใช้ระบบ Trash ให้เปลี่ยนเป็น: 
    // doc.isDeleted = true; doc.deletedAt = new Date(); await doc.save();
    await Document.findByIdAndDelete(id); 

    res.json({ message: "ลบไฟล์สำเร็จ" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบไฟล์" });
  }
};

// --- 3. Get All Documents (Optional - อาจไม่ได้ใช้ถ้าใช้ folderController) ---
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. Download Document (Optional) ---
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
            res.status(404).json({ message: "ไฟล์ต้นฉบับหายไป" });
        }
    } catch (error) {
        res.status(500).json({ message: "ดาวน์โหลดล้มเหลว" });
    }
};