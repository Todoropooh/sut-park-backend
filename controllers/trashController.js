// controllers/trashController.js

import News from '../models/newsModel.js';
import Activity from '../models/activityModel.js';
import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import Employee from '../models/employee.js';
// import Service from '../models/serviceModel.js'; // (ถ้ามี Service ก็ import มาด้วยนะครับ)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. ดึงข้อมูลทั้งหมดในถังขยะ (Unified Array) ---
export const getTrashItems = async (req, res) => {
  try {
    // 1. ดึงข้อมูลที่ถูกลบจากทุก Model (+Populate User)
    const deletedFolders = await Folder.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedFiles = await Document.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedNews = await News.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedActivities = await Activity.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    
    // 🟢 เพิ่ม: ดึงข้อมูลพนักงานที่ถูกลบ
    const deletedEmployees = await Employee.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();

    // 2. จัด Format ข้อมูล
    const formattedFolders = deletedFolders.map(item => ({ _id: item._id, type: 'folder', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedFiles = deletedFiles.map(item => ({ _id: item._id, type: 'file', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedNews = deletedNews.map(item => ({ _id: item._id, type: 'news', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedActivities = deletedActivities.map(item => ({ _id: item._id, type: 'activity', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    
    // 🟢 เพิ่ม: Format ข้อมูลพนักงาน
    const formattedEmployees = deletedEmployees.map(item => ({
      _id: item._id,
      type: 'employee',
      deletedAt: item.deletedAt,
      deletedBy: item.deletedBy,
      data: item // ส่งข้อมูลดิบไป (ชื่อ/นามสกุล)
    }));

    // 3. รวมเป็น Array เดียว
    const allItems = [
      ...formattedFolders,
      ...formattedFiles,
      ...formattedNews,
      ...formattedActivities,
      ...formattedEmployees // 🟢 รวมพนักงานเข้าไปด้วย
    ];

    // 4. เรียงลำดับตามวันที่ลบล่าสุด
    allItems.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    res.json(allItems); 

  } catch (err) {
    console.error("Error in getTrashItems:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 2. กู้คืน (Restore) ---
export const restoreItem = async (req, res) => {
  try {
    const { id, type } = req.body;
    const restoreInfo = { isDeleted: false, deletedAt: null, deletedBy: null };

    let Model;
    switch (type) {
      case 'file':     Model = Document; break;
      case 'folder':   Model = Folder;   break;
      case 'news':     Model = News;     break;
      case 'activity': Model = Activity; break;
      case 'employee': Model = Employee; break; // 🟢 เพิ่ม case
      default: return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
    
    await Model.findByIdAndUpdate(id, restoreInfo);
    res.json({ message: `กู้คืน ${type} สำเร็จ` });

  } catch (err) {
    console.error("Error in restoreItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 3. ลบถาวร (Permanent Delete) ---
export const deleteItemPermanently = async (req, res) => {
  try {
    const { type } = req.body; 
    const { id } = req.params;

    let item;

    switch (type) {
      case 'file':
        item = await Document.findById(id);
        if (item) {
          if (item.path) deleteFile(item.path);
          await Document.findByIdAndDelete(id);
        }
        break;

      case 'folder':
        const subFolders = await Folder.countDocuments({ parentId: id });
        const filesInFolder = await Document.countDocuments({ folderId: id });
        if (subFolders > 0 || filesInFolder > 0) return res.status(400).json({ message: 'โฟลเดอร์ไม่ว่าง' });
        await Folder.findByIdAndDelete(id);
        break;

      case 'news':
        item = await News.findById(id);
        if (item) {
          if (item.imageUrl) deleteFile(item.imageUrl);
          await News.findByIdAndDelete(id);
        }
        break;

      case 'activity':
        item = await Activity.findById(id);
        if (item) {
          if (item.imageUrl) deleteFile(item.imageUrl);
          await Activity.findByIdAndDelete(id);
        }
        break;

      // 🟢 เพิ่ม: ลบพนักงานถาวร
      case 'employee':
        item = await Employee.findById(id);
        if (item) {
          // ถ้ามีรูปประจำตัว ให้ลบไฟล์รูปด้วย
          if (item.imageUrl) deleteFile(item.imageUrl);
          await Employee.findByIdAndDelete(id);
        }
        break;

      default:
        return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }

    res.json({ message: `ลบถาวรสำเร็จ (${type})` });

  } catch (err) {
    console.error("Error in deleteItemPermanently:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Helper Function: ลบไฟล์ออกจากเครื่อง
const deleteFile = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../', filePath.startsWith('/') ? filePath.substring(1) : filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        console.error("Error deleting file:", err);
    }
};