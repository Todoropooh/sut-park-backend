// controllers/folderController.js (ไฟล์ใหม่)

import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// (Fix __dirname ที่เราเคยทำ)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. (ฟังก์ชันหลัก) ดึงข้อมูลในโฟลเดอร์ ---
// (ดึงทั้งโฟลเดอร์ย่อย, ไฟล์, และ Breadcrumbs)
export const getContents = async (req, res) => {
  try {
    // 1. หา ID โฟลเดอร์ปัจจุบัน (ถ้าไม่มี คือ 'null' = Root)
    const currentFolderId = req.query.folderId || null;

    // 2. ดึงโฟลเดอร์ย่อย (Subfolders)
    const folders = await Folder.find({ parentId: currentFolderId }).sort('name');

    // 3. ดึงไฟล์ (Files)
    const files = await Document.find({ folderId: currentFolderId }).sort('originalFilename');

    // 4. (สำคัญ) สร้าง Breadcrumbs (แถบนำทาง)
    const breadcrumbs = [];
    let tempId = currentFolderId;

    // (วน Loop ย้อนกลับไปหา "แม่" จนถึง Root)
    while (tempId) {
      const folder = await Folder.findById(tempId).select('name parentId');
      if (!folder) break; // (กัน Error ถ้า ID ผิด)
      breadcrumbs.unshift({ _id: folder._id, name: folder.name }); // (เพิ่มเข้า "ด้านหน้า")
      tempId = folder.parentId;
    }
    
    // (เพิ่ม "Root" เป็นอันแรกสุด)
    breadcrumbs.unshift({ _id: null, name: 'Root' });

    res.json({ folders, files, breadcrumbs });

  } catch (err) {
    console.error("Error in getContents:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 2. สร้างโฟลเดอร์ใหม่ ---
export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อโฟลเดอร์' });
    }

    const newFolder = new Folder({
      name,
      parentId: parentId || null, // (ถ้าไม่ส่ง parentId มา = อยู่ Root)
    });

    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (err) {
    console.error("Error in createFolder:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 3. เปลี่ยนชื่อ (ไฟล์ หรือ โฟลเดอร์) ---
export const renameItem = async (req, res) => {
  try {
    const { id, type, newName } = req.body; // (type = 'file' or 'folder')

    if (!newName) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อใหม่' });
    }

    let updatedItem;
    if (type === 'folder') {
      updatedItem = await Folder.findByIdAndUpdate(id, { name: newName }, { new: true });
    } else if (type === 'file') {
      updatedItem = await Document.findByIdAndUpdate(id, { originalFilename: newName }, { new: true });
    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

    if (!updatedItem) {
      return res.status(404).json({ message: 'ไม่พบรายการ' });
    }
    res.json(updatedItem);

  } catch (err) {
    console.error("Error in renameItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 4. ลบ (ไฟล์ หรือ โฟลเดอร์) ---
export const deleteItem = async (req, res) => {
  try {
    const { id, type } = req.body;

    if (type === 'file') {
      // 4.1 ถ้าเป็น "ไฟล์" -> ลบไฟล์จริง และ ลบข้อมูลใน DB
      const doc = await Document.findById(id);
      if (!doc) return res.status(404).json({ message: 'ไม่พบไฟล์ใน DB' });

      // (ลบไฟล์จริงออกจาก /uploads/documents/...)
      // (เราต้องมั่นใจว่า path ใน DB ถูกต้อง)
      const filePath = path.join(__dirname, '../', doc.path.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await Document.findByIdAndDelete(id);
      res.json({ message: 'ลบไฟล์สำเร็จ' });

    } else if (type === 'folder') {
      // 4.2 ถ้าเป็น "โฟลเดอร์" -> ต้องเช็คก่อนว่า "ว่าง" หรือไม่
      const subFolders = await Folder.countDocuments({ parentId: id });
      const filesInFolder = await Document.countDocuments({ folderId: id });

      if (subFolders > 0 || filesInFolder > 0) {
        return res.status(400).json({ message: 'ไม่สามารถลบได้ โฟลเดอร์นี้ไม่ว่าง' });
      }

      await Folder.findByIdAndDelete(id);
      res.json({ message: 'ลบโฟลเดอร์สำเร็จ' });

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error("Error in deleteItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};