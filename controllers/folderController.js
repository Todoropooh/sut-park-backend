// controllers/folderController.js (เพิ่มฟังก์ชัน Tree View)

import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// (Fix __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️⭐️⭐️ (เพิ่มฟังก์ชันช่วย (Helper) นี้) ⭐️⭐️⭐️
// (ฟังก์ชัน Recursive สำหรับสร้างโครงสร้างต้นไม้)
async function buildTreeStructure(parentId) {
  // 1. ค้นหาโฟลเดอร์ลูก (ที่ยังไม่ถูกลบ)
  const folders = await Folder.find({ 
    parentId: parentId, 
    isDeleted: false 
  }).sort('name');

  const tree = [];

  for (const folder of folders) {
    // 2. (เรียกตัวเองซ้ำ) ค้นหา "หลาน"
    const children = await buildTreeStructure(folder._id);
    
    // 3. จัด Format ให้ Ant Design Tree เข้าใจ
    tree.push({
      title: folder.name,
      key: folder._id.toString(), // (key คือ ID ของโฟลเดอร์)
      // (เราจะส่ง Icon เป็น String ให้ Frontend)
      // icon: 'FolderOutlined', 
      children: children.length > 0 ? children : [], // (ถ้ามีลูก ให้ใส่ Array ลูก)
    });
  }
  
  return tree;
}

// ... (โค้ด Controller เดิมของคุณ: getContents, createFolder, renameItem, deleteItem, moveItem, copyItem) ...

// --- 1. (ฟังก์ชันหลัก) ดึงข้อมูลในโฟลเดอร์ ---
export const getContents = async (req, res) => {
  try {
    const currentFolderId = req.query.folderId || null;

    const folders = await Folder.find({ 
      parentId: currentFolderId, 
      isDeleted: false 
    }).sort('name');

    const files = await Document.find({ 
      folderId: currentFolderId, 
      isDeleted: false 
    }).sort('originalFilename');

    const breadcrumbs = [];
    let tempId = currentFolderId;
    while (tempId) {
      const folder = await Folder.findById(tempId).select('name parentId');
      if (!folder) break; 
      breadcrumbs.unshift({ _id: folder._id, name: folder.name });
      tempId = folder.parentId;
    }
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
      parentId: parentId || null,
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
    const { id, type, newName } = req.body; 
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

// --- 4. ⭐️ (แก้ไข) ลบ (Soft Delete) ---
export const deleteItem = async (req, res) => {
  try {
    const { id, type } = req.body;
    const deleteInfo = {
      isDeleted: true,
      deletedAt: new Date()
    };

    if (type === 'file') {
      await Document.findByIdAndUpdate(id, deleteInfo);
      res.json({ message: 'ย้ายไฟล์ไปถังขยะแล้ว' });

    } else if (type === 'folder') {
      await Folder.findByIdAndUpdate(id, deleteInfo);
      res.json({ message: 'ย้ายโฟลเดอร์ไปถังขยะแล้ว' });

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
  } catch (err) {
    console.error("Error in deleteItem (Soft Delete):", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 5. ย้าย (ไฟล์ หรือ โฟลเดอร์) ---
export const moveItem = async (req, res) => {
  try {
    const { itemId, itemType, destinationFolderId } = req.body;

    if (itemId === destinationFolderId) {
      return res.status(400).json({ message: 'ไม่สามารถย้ายไปยังตำแหน่งเดิมได้' });
    }

    if (itemType === 'folder') {
      const folder = await Folder.findById(itemId);
      if (!folder) return res.status(404).json({ message: 'ไม่พบโฟลเดอร์' });
      
      if (folder.parentId?.toString() === destinationFolderId) {
         return res.status(400).json({ message: 'รายการนี้อยู่ในโฟลเดอร์นั้นอยู่แล้ว' });
      }
      
      folder.parentId = destinationFolderId || null;
      await folder.save();
      res.json(folder);

    } else if (itemType === 'file') {
      const file = await Document.findById(itemId);
      if (!file) return res.status(404).json({ message: 'ไม่พบไฟล์' });

      if (file.folderId?.toString() === destinationFolderId) {
         return res.status(400).json({ message: 'ไฟล์นี้อยู่ในโฟลเดอร์นั้นอยู่แล้ว' });
      }
      
      file.folderId = destinationFolderId || null;
      await file.save();
      res.json(file);

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error("Error in moveItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 6. คัดลอก (ไฟล์ หรือ โฟลเดอร์) ---
export const copyItem = async (req, res) => {
  try {
    const { itemId, itemType, destinationFolderId } = req.body;

    if (itemType === 'folder') {
      await recursiveCopy(itemId, destinationFolderId || null);
      res.json({ message: 'คัดลอกโฟลเดอร์สำเร็จ' });

    } else if (itemType === 'file') {
      const originalFile = await Document.findById(itemId);
      if (!originalFile) return res.status(404).json({ message: 'ไม่พบไฟล์' });

      const newFile = new Document({
        originalFilename: `${originalFile.originalFilename} (Copy)`,
        storedFilename: originalFile.storedFilename, 
        path: originalFile.path,
        description: originalFile.description,
        folderId: destinationFolderId || null, 
        size: originalFile.size,
      });
      await newFile.save();
      res.json(newFile);

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error("Error in copyItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ⭐️⭐️⭐️ (นี่คือฟังก์ชันที่เพิ่มเข้ามาใหม่ครับ) ⭐️⭐️⭐️
// --- 7. ดึงข้อมูล Tree View (สำหรับ Sidebar) ---
export const getFolderTree = async (req, res) => {
  try {
    // (เริ่มสร้างต้นไม้จาก Root (parentId: null))
    const treeData = await buildTreeStructure(null);
    
    // (เพิ่ม Node "Root" (Home) เข้าไปเป็นอันแรกสุด)
    const fullTree = [
      {
        title: 'Root (หน้าแรก)',
        key: null, // (key: null คือ Root)
        // icon: 'HomeOutlined', // (ให้ Frontend จัดการ Icon เอง)
        children: treeData,
      }
    ];

    res.json(fullTree);
    
  } catch (err) {
    console.error("Error in getFolderTree:", err);
    res.status(500).json({ error: "Server error" });
  }
};