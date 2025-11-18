// controllers/folderController.js (Updated with '0-0' fixes)

import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// (Fix __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐️⭐️⭐️ (Helper Function: buildTreeStructure) ⭐️⭐️⭐️
// (ฟังก์ชัน Recursive สำหรับสร้างโครงสร้างต้นไม้)
// (ฟังก์ชันนี้ถูกต้องแล้ว ไม่ต้องแก้ไข เพราะ 'parentId' (null) คือการคุยกับ DB)
async function buildTreeStructure(parentId) {
  // 1. ค้นหาโฟลเดอร์ลูก (ที่ยังไม่ถูกลบ)
  const folders = await Folder.find({ 
    parentId: parentId, // (ใช้ parentId (เช่น null) เพื่อค้นหาใน DB)
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
      children: children.length > 0 ? children : [], 
    });
  }
  
  return tree;
}

// --- 1. (ฟังก์ชันหลัก) ดึงข้อมูลในโฟลเดอร์ ---
export const getContents = async (req, res) => {
  try {
    const folderIdFromQuery = req.query.folderId;

    // 👇 [FIXED] แปลง '0-0' (จาก Frontend) เป็น 'null' (สำหรับ Mongoose)
    const currentFolderId = (folderIdFromQuery === '0-0' || !folderIdFromQuery) 
                              ? null 
                              : folderIdFromQuery;

    const folders = await Folder.find({ 
      parentId: currentFolderId, // 👈 ใช้ตัวแปรที่แปลงแล้ว
      isDeleted: false 
    }).sort('name');

    const files = await Document.find({ 
      folderId: currentFolderId, // 👈 ใช้ตัวแปรที่แปลงแล้ว
      isDeleted: false 
    }).sort('originalFilename');

    const breadcrumbs = [];
    let tempId = currentFolderId; // (ใช้ ID ที่แปลงแล้ว)
    while (tempId) {
      const folder = await Folder.findById(tempId).select('name parentId');
      if (!folder) break; 
      breadcrumbs.unshift({ _id: folder._id, name: folder.name });
      tempId = folder.parentId;
    }
    
    // 👇 [FIXED] ส่ง '0-0' เป็น _id ของ Root ให้ Frontend
    breadcrumbs.unshift({ _id: '0-0', name: 'Root' });

    res.json({ folders, files, breadcrumbs });

  } catch (err) {
    console.error("Error in getContents:", err);
    // (CastError จะถูกจับที่นี่ ถ้ายังส่ง ID ที่ผิดพลาดมา)
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// --- 2. สร้างโฟลเดอร์ใหม่ ---
export const createFolder = async (req, res) => {
  try {
    const { name, parentId: parentIdFromRequest } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อโฟลเดอร์' });
    }

    // 👇 [FIXED] แปลง '0-0' เป็น 'null' ก่อนบันทึก
    const parentIdForDB = (parentIdFromRequest === '0-0' || !parentIdFromRequest)
                            ? null
                            : parentIdFromRequest;

    const newFolder = new Folder({
      name,
      parentId: parentIdForDB, // 👈 ใช้ตัวแปรที่แปลงแล้ว
    });
    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (err) {
    console.error("Error in createFolder:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// --- 3. เปลี่ยนชื่อ (ไฟล์ หรือ โฟลเดอร์) ---
// (ฟังก์ชันนี้ไม่เกี่ยวข้องกับ parentId ไม่ต้องแก้ไข)
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
// (ฟังก์ชันนี้ไม่เกี่ยวข้องกับ parentId ไม่ต้องแก้ไข)
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
    const { itemId, itemType, destinationFolderId: destIdFromRequest } = req.body;

    // 👇 [FIXED] แปลง '0-0' เป็น 'null'
    const destinationFolderId = (destIdFromRequest === '0-0' || !destIdFromRequest)
                                  ? null
                                  : destIdFromRequest;
    
    // (การตรวจสอบการย้ายไปที่เดิม ต้องใช้ค่าที่แปลงแล้ว)
    if (itemId === destinationFolderId) {
      return res.status(400).json({ message: 'ไม่สามารถย้ายไปยังตำแหน่งเดิมได้' });
    }

    if (itemType === 'folder') {
      const folder = await Folder.findById(itemId);
      if (!folder) return res.status(404).json({ message: 'ไม่พบโฟลเดอร์' });
      
      // 👇 [FIXED] ตรวจสอบตำแหน่งเดิม (รองรับ null)
      const isSameLocation = (folder.parentId === null && destinationFolderId === null) || 
                             (folder.parentId?.toString() === destinationFolderId);
      if (isSameLocation) {
         return res.status(400).json({ message: 'รายการนี้อยู่ในโฟลเดอร์นั้นอยู่แล้ว' });
      }
      
      folder.parentId = destinationFolderId; // 👈 ใช้ตัวแปรที่แปลงแล้ว
      await folder.save();
      res.json(folder);

    } else if (itemType === 'file') {
      const file = await Document.findById(itemId);
      if (!file) return res.status(404).json({ message: 'ไม่พบไฟล์' });

      // 👇 [FIXED] ตรวจสอบตำแหน่งเดิม (รองรับ null)
      const isSameFileLocation = (file.folderId === null && destinationFolderId === null) ||
                                 (file.folderId?.toString() === destinationFolderId);
      if (isSameFileLocation) {
         return res.status(400).json({ message: 'ไฟล์นี้อยู่ในโฟลเดอร์นั้นอยู่แล้ว' });
      }
      
      file.folderId = destinationFolderId; // 👈 ใช้ตัวแปรที่แปลงแล้ว
      await file.save();
      res.json(file);

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error("Error in moveItem:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// --- 6. คัดลอก (ไฟล์ หรือ โฟลเดอร์) ---
export const copyItem = async (req, res) => {
  try {
    const { itemId, itemType, destinationFolderId: destIdFromRequest } = req.body;

    // 👇 [FIXED] แปลง '0-0' เป็น 'null'
    const destinationFolderId = (destIdFromRequest === '0-0' || !destIdFromRequest)
                                  ? null
                                  : destIdFromRequest;

    if (itemType === 'folder') {
      // (สันนิษฐานว่าคุณมีฟังก์ชัน recursiveCopy ที่รับ parentId เป็น null ได้)
      await recursiveCopy(itemId, destinationFolderId); // 👈 ใช้ตัวแปรที่แปลงแล้ว
      res.json({ message: 'คัดลอกโฟลเดอร์สำเร็จ' });

    } else if (itemType === 'file') {
      const originalFile = await Document.findById(itemId);
      if (!originalFile) return res.status(404).json({ message: 'ไม่พบไฟล์' });

      const newFile = new Document({
        originalFilename: `${originalFile.originalFilename} (Copy)`,
        storedFilename: originalFile.storedFilename, 
        path: originalFile.path,
        description: originalFile.description,
        folderId: destinationFolderId, // 👈 ใช้ตัวแปรที่แปลงแล้ว
        size: originalFile.size,
      });
      await newFile.save();
      res.json(newFile);

    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error("Error in copyItem:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// ⭐️⭐️⭐️ (ฟังก์ชันใหม่) ⭐️⭐️⭐️
// --- 7. ดึงข้อมูล Tree View (สำหรับ Sidebar) ---
export const getFolderTree = async (req, res) => {
  try {
    // (เริ่มสร้างต้นไม้จาก Root (parentId: null) ซึ่งถูกต้อง)
    const treeData = await buildTreeStructure(null);
    
    // (เพิ่ม Node "Root" (Home) เข้าไปเป็นอันแรกสุด)
    const fullTree = [
      {
        title: 'Root (หน้าแรก)',
        // 👇 [FIXED] ส่ง key '0-0' ให้ Antd Tree (แก้ Warning 'key: null')
        key: '0-0',
        children: treeData,
      }
    ];

    res.json(fullTree);
    
  } catch (err) {
    console.error("Error in getFolderTree:", err);
    res.status(500).json({ error: "Server error" });
  }
};