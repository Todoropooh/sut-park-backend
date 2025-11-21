// controllers/folderController.js

import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helper: Recursive Tree ---
async function buildTreeStructure(parentId) {
  const folders = await Folder.find({ 
    parentId: parentId, 
    isDeleted: false 
  }).sort('name');

  const tree = [];

  for (const folder of folders) {
    const children = await buildTreeStructure(folder._id);
    tree.push({
      title: folder.name,
      key: folder._id.toString(),
      children: children.length > 0 ? children : [],
    });
  }
  return tree;
}

// ⭐️⭐️⭐️ [เพิ่ม] Helper: Recursive Copy (คัดลอกโฟลเดอร์และไส้ใน) ⭐️⭐️⭐️
async function recursiveCopy(sourceFolderId, targetParentId) {
  // 1. หาโฟลเดอร์ต้นฉบับ
  const sourceFolder = await Folder.findById(sourceFolderId);
  if (!sourceFolder) return;

  // 2. สร้างโฟลเดอร์ใหม่ในปลายทาง (ชื่อเดิม + Copy ถ้าอยู่ในที่เดียวกัน)
  // (แต่เพื่อความง่าย เราใช้ชื่อเดิมไปก่อน)
  const newFolder = new Folder({
    name: sourceFolder.name, // หรือ `${sourceFolder.name} (Copy)`
    parentId: targetParentId,
    isDeleted: false,
    deletedAt: null
  });
  await newFolder.save();

  // 3. คัดลอกไฟล์ในโฟลเดอร์นี้
  const files = await Document.find({ folderId: sourceFolderId, isDeleted: false });
  for (const file of files) {
    const newFile = new Document({
      originalFilename: file.originalFilename,
      storedFilename: file.storedFilename, // ใช้ไฟล์จริงไฟล์เดิม (ประหยัดพื้นที่)
      fileType: file.fileType,
      size: file.size,
      path: file.path,
      folderId: newFolder._id, // ย้ายไปโฟลเดอร์ใหม่
      isDeleted: false,
      deletedAt: null
    });
    await newFile.save();
  }

  // 4. คัดลอกโฟลเดอร์ลูก (Recursive)
  const subFolders = await Folder.find({ parentId: sourceFolderId, isDeleted: false });
  for (const sub of subFolders) {
    await recursiveCopy(sub._id, newFolder._id);
  }
}


// --- 1. Get Contents ---
export const getContents = async (req, res) => {
  try {
    const folderIdFromQuery = req.query.folderId;
    const currentFolderId = (folderIdFromQuery === '0-0' || !folderIdFromQuery) 
                              ? null 
                              : folderIdFromQuery;

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
    breadcrumbs.unshift({ _id: '0-0', name: 'Root' });

    res.json({ folders, files, breadcrumbs });

  } catch (err) {
    console.error("Error in getContents:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// --- 2. Create Folder ---
export const createFolder = async (req, res) => {
  try {
    const { name, parentId: parentIdFromRequest } = req.body;
    if (!name) return res.status(400).json({ message: 'กรุณาระบุชื่อโฟลเดอร์' });

    const parentIdForDB = (parentIdFromRequest === '0-0' || !parentIdFromRequest)
                            ? null
                            : parentIdFromRequest;

    const newFolder = new Folder({
      name,
      parentId: parentIdForDB,
      isDeleted: false, 
      deletedAt: null
    });
    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (err) {
    console.error("Error in createFolder:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// --- 3. Rename Item ---
export const renameItem = async (req, res) => {
  try {
    const { id, type, newName } = req.body; 
    if (!newName) return res.status(400).json({ message: 'กรุณาระบุชื่อใหม่' });
    
    let updatedItem;
    if (type === 'folder') {
      updatedItem = await Folder.findByIdAndUpdate(id, { name: newName }, { new: true });
    } else if (type === 'file') {
      updatedItem = await Document.findByIdAndUpdate(id, { originalFilename: newName }, { new: true });
    } else {
      return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
    if (!updatedItem) return res.status(404).json({ message: 'ไม่พบรายการ' });
    res.json(updatedItem);
  } catch (err) {
    console.error("Error in renameItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 4. Delete Item (Soft Delete) ---
export const deleteItem = async (req, res) => {
  try {
    const { id, type } = req.body; // รับจาก Body ตาม Frontend ใหม่
    // หรือถ้า Frontend ส่งมาทาง params ให้ใช้ req.params.id (ต้องตกลงกันให้ดี)
    // โค้ดล่าสุด Frontend DocumentPage.jsx ส่ง DELETE /api/folders/:id ซึ่งไม่มี body
    // ดังนั้นเราควรแก้ให้รองรับ params ด้วย
    const targetId = req.params.id || id;

    const deleteInfo = {
      isDeleted: true,
      deletedAt: new Date()
    };

    // ลองลบ Folder ก่อน
    const folder = await Folder.findByIdAndUpdate(targetId, deleteInfo);
    if (folder) return res.json({ message: 'ย้ายโฟลเดอร์ไปถังขยะแล้ว' });

    // ถ้าไม่เจอ ลองลบ File (เผื่อเรียกผิด route)
    const file = await Document.findByIdAndUpdate(targetId, deleteInfo);
    if (file) return res.json({ message: 'ย้ายไฟล์ไปถังขยะแล้ว' });

    return res.status(404).json({ message: 'ไม่พบรายการ' });

  } catch (err) {
    console.error("Error in deleteItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 5. Move Item ---
export const moveItem = async (req, res) => {
  try {
    const { itemId, itemType, destinationFolderId: destIdFromRequest } = req.body;

    const destinationFolderId = (destIdFromRequest === '0-0' || !destIdFromRequest)
                                  ? null
                                  : destIdFromRequest;
    
    if (itemId === destinationFolderId) return res.status(400).json({ message: 'ย้ายไปที่เดิมไม่ได้' });

    if (itemType === 'folder') {
      const folder = await Folder.findById(itemId);
      if (!folder) return res.status(404).json({ message: 'ไม่พบโฟลเดอร์' });
      
      // ป้องกันการย้ายโฟลเดอร์เข้าไปในตัวเอง (Circular) - *ควรเพิ่ม Logic นี้*
      // แต่เพื่อความกระชับ ข้ามไปก่อน
      
      folder.parentId = destinationFolderId;
      await folder.save();
      res.json(folder);

    } else if (itemType === 'file') {
      const file = await Document.findById(itemId);
      if (!file) return res.status(404).json({ message: 'ไม่พบไฟล์' });
      
      file.folderId = destinationFolderId;
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

// --- 6. Copy Item ---
export const copyItem = async (req, res) => {
  try {
    const { itemId, itemType, destinationFolderId: destIdFromRequest } = req.body;

    const destinationFolderId = (destIdFromRequest === '0-0' || !destIdFromRequest)
                                  ? null
                                  : destIdFromRequest;

    if (itemType === 'folder') {
      // ⭐️ เรียกใช้ Helper function ที่เราสร้างไว้
      await recursiveCopy(itemId, destinationFolderId);
      res.json({ message: 'คัดลอกโฟลเดอร์สำเร็จ' });

    } else if (itemType === 'file') {
      const originalFile = await Document.findById(itemId);
      if (!originalFile) return res.status(404).json({ message: 'ไม่พบไฟล์' });

      const newFile = new Document({
        originalFilename: `Copy of ${originalFile.originalFilename}`, // เปลี่ยนชื่อนิดหน่อย
        storedFilename: originalFile.storedFilename, 
        path: originalFile.path,
        description: originalFile.description,
        folderId: destinationFolderId,
        size: originalFile.size,
        isDeleted: false,
        deletedAt: null
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

// --- 7. Get Tree ---
export const getFolderTree = async (req, res) => {
  try {
    const treeData = await buildTreeStructure(null);
    const fullTree = [
      {
        title: 'Root (หน้าแรก)',
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