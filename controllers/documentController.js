// src/controllers/documentController.js

import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Upload Documents ---
export const uploadDocument = async (req, res) => {
    try {
        // เช็คว่ามีไฟล์ส่งมาไหม
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์' });
        }

        const { folderId } = req.body;
        const savedDocuments = [];

        // วนลูปบันทึกทีละไฟล์
        for (const file of req.files) {
            const newDoc = new Document({
                originalFilename: file.originalname, // ชื่อไฟล์เดิม (เช่น รายงาน.pdf)
                
                // 🟢 [FIX] ต้องเพิ่มบรรทัดนี้ครับ ไม่งั้น Error Validation Failed
                filename: file.filename,             
                
                path: file.path,                     // path ที่เก็บไฟล์
                size: file.size,
                mimetype: file.mimetype,
                folderId: folderId || '0-0',         // ถ้าไม่ส่งมา ให้ลง Root
                isDeleted: false,
                deletedAt: null,
                deletedBy: null
            });

            await newDoc.save();
            savedDocuments.push(newDoc);
        }

        res.status(201).json({ 
            message: `อัปโหลดสำเร็จ ${savedDocuments.length} ไฟล์`, 
            data: savedDocuments 
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลด' });
    }
};

// --- Delete Document (Soft Delete + User Tracking) ---
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        // บันทึกคนลบ (deletedBy)
        await Document.findByIdAndUpdate(id, { 
            isDeleted: true, 
            deletedAt: new Date(),
            deletedBy: req.user ? req.user._id : null 
        });

        res.json({ message: "ย้ายไฟล์ไปถังขยะแล้ว" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- (Optional) Get Documents in Folder ---
export const getDocuments = async (req, res) => {
    try {
        const { folderId } = req.query;
        // ดึงเฉพาะที่ยังไม่ถูกลบ
        const docs = await Document.find({ 
            folderId: folderId || '0-0', 
            isDeleted: false 
        }).sort({ createdAt: -1 });
        
        res.json({ files: docs });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};