// src/controllers/trashController.js

import News from '../models/newsModel.js';
import Activity from '../models/activityModel.js';
import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import Employee from '../models/employee.js'; // 🟢 เช็คชื่อไฟล์ให้ตรง (employee.js หรือ Employee.js)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. ดึงข้อมูลทั้งหมด ---
export const getTrashItems = async (req, res) => {
  try {
    const deletedFolders = await Folder.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedFiles = await Document.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedNews = await News.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedActivities = await Activity.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();
    const deletedEmployees = await Employee.find({ isDeleted: true }).populate('deletedBy', 'username role avatar').lean();

    const formattedFolders = deletedFolders.map(item => ({ _id: item._id, type: 'folder', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedFiles = deletedFiles.map(item => ({ _id: item._id, type: 'file', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedNews = deletedNews.map(item => ({ _id: item._id, type: 'news', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedActivities = deletedActivities.map(item => ({ _id: item._id, type: 'activity', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));
    const formattedEmployees = deletedEmployees.map(item => ({ _id: item._id, type: 'employee', deletedAt: item.deletedAt, deletedBy: item.deletedBy, data: item }));

    const allItems = [
      ...formattedFolders, ...formattedFiles, ...formattedNews, ...formattedActivities, ...formattedEmployees
    ];

    allItems.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    res.json(allItems); 
  } catch (err) {
    console.error("Error in getTrashItems:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 2. กู้คืน (แก้ไขรับ ID จาก params) ---
export const restoreItem = async (req, res) => {
  try {
    // 🟢 แก้ตรงนี้: รับ id จาก URL, รับ type จาก Body
    const { id } = req.params; 
    const { type } = req.body;

    const restoreInfo = { isDeleted: false, deletedAt: null, deletedBy: null };

    let Model;
    switch (type) {
      case 'file':     Model = Document; break;
      case 'folder':   Model = Folder;   break;
      case 'news':     Model = News;     break;
      case 'activity': Model = Activity; break;
      case 'employee': Model = Employee; break;
      default: return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
    
    await Model.findByIdAndUpdate(id, restoreInfo);
    res.json({ message: `กู้คืน ${type} สำเร็จ` });

  } catch (err) {
    console.error("Error in restoreItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 3. ลบถาวร (แก้ไขรับ ID จาก params) ---
export const deleteItemPermanently = async (req, res) => {
  try {
    // 🟢 แก้ตรงนี้: รับ id จาก URL, รับ type จาก Body
    const { id } = req.params;
    const { type } = req.body; 

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

      case 'employee':
        item = await Employee.findById(id);
        if (item) {
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

const deleteFile = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../', filePath.startsWith('/') ? filePath.substring(1) : filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (err) { console.error("Error deleting file:", err); }
};