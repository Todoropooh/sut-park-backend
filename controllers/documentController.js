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
                originalFilename: file.originalname,
                
                // 🟢 [FIX] บรรทัดนี้สำคัญมาก! ต้องมี ไม่งั้น Error 500
                filename: file.filename,             
                
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                folderId: folderId || '0-0',
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
        // ส่ง Error กลับไปดูชัดๆ ว่าพังตรงไหน
        res.status(500).json({ 
            message: 'เกิดข้อผิดพลาดในการอัปโหลด', 
            error: error.message 
        });
    }
};

// --- Delete Document ---
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
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

// --- Get Documents (ถ้ามี) ---
export const getDocuments = async (req, res) => {
    try {
        const { folderId } = req.query;
        const docs = await Document.find({ 
            folderId: folderId || '0-0', 
            isDeleted: false 
        }).sort({ createdAt: -1 });
        
        res.json(docs); // ส่งกลับเป็น Array ตรงๆ (เพื่อให้ Frontend รับง่าย)
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};