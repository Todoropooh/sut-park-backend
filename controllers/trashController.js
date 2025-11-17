// controllers/trashController.js (ไฟล์ใหม่)

import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// (Fix __dirname ที่เราเคยทำ)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. ดึงข้อมูลทั้งหมดในถังขยะ ---
export const getTrashItems = async (req, res) => {
  try {
    // (ดึงโฟลเดอร์ที่ถูกลบ)
    const folders = await Folder.find({ isDeleted: true }).sort('-deletedAt');
    
    // (ดึงไฟล์ที่ถูกลบ)
    const files = await Document.find({ isDeleted: true }).sort('-deletedAt');

    res.json({ folders, files });
  } catch (err) {
    console.error("Error in getTrashItems:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 2. กู้คืน (ไฟล์ หรือ โฟลเดอร์) ---
export const restoreItem = async (req, res) => {
  try {
    const { id, type } = req.body;
    const restoreInfo = {
      isDeleted: false,
      deletedAt: null
    };

    if (type === 'file') {
      await Document.findByIdAndUpdate(id, restoreInfo);
      res.json({ message: 'กู้คืนไฟล์สำเร็จ' });

    } else if (type === 'folder') {
      // (หมายเหตุ: Logic นี้จะกู้คืนแค่โฟลเดอร์เดียว
      //  ของที่อยู่ข้างใน (ถ้าถูกลบพร้อมกัน) ต้องกู้คืนแยกต่างหาก
      //  ในอนาคต เราสามารถอัปเกรดเป็น Recursive Restore ได้)
      await Folder.findByIdAndUpdate(id, restoreInfo);
      res.json({ message: 'กู้คืนโฟลเดอร์สำเร็จ' });

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
  } catch (err) {
    console.error("Error in restoreItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 3. ลบถาวร (ไฟล์ หรือ โฟลเดอร์) ---
export const deleteItemPermanently = async (req, res) => {
  try {
    const { id, type } = req.body;

    if (type === 'file') {
      // 1. ถ้าเป็น "ไฟล์" -> ลบไฟล์จริง และ ลบข้อมูลใน DB
      const doc = await Document.findById(id);
      if (doc) {
        // (ลบไฟล์จริงออกจาก /uploads/documents/...)
        const filePath = path.join(__dirname, '../', doc.path.substring(1));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await Document.findByIdAndDelete(id);
      }
      res.json({ message: 'ลบไฟล์ถาวรสำเร็จ' });

    } else if (type === 'folder') {
      // 2. ถ้าเป็น "โฟลเดอร์"
      // (Logic นี้จะลบได้แค่โฟลเดอร์ที่ว่างเปล่าในถังขยะ
      //  ในอนาคต เราสามารถอัปเกรดเป็น Recursive Delete (ลบถอนราก) ได้)
      
      // (ตรวจสอบอีกครั้งว่าว่างจริงหรือไม่ แม้จะอยู่ในถังขยะ)
      const subFolders = await Folder.countDocuments({ parentId: id });
      const filesInFolder = await Document.countDocuments({ folderId: id });

      if (subFolders > 0 || filesInFolder > 0) {
        return res.status(400).json({ message: 'ไม่สามารถลบถาวรได้ โฟลเดอร์นี้ยังไม่ว่าง (อาจต้องลบไฟล์ข้างในก่อน)' });
      }
      
      await Folder.findByIdAndDelete(id);
      res.json({ message: 'ลบโฟลเดอร์ถาวรสำเร็จ' });

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
  } catch (err) {
    console.error("Error in deleteItemPermanently:", err);
    res.status(500).json({ error: "Server error" });
  }
};