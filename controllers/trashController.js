// controllers/trashController.js (Final Unified Array Version)

import News from '../models/newsModel.js';
import Activity from '../models/activityModel.js';
import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. ดึงข้อมูลทั้งหมดในถังขยะ (Unified Array) ---
export const getTrashItems = async (req, res) => {
  try {
    // 1. ดึงข้อมูลที่ถูกลบจากทุก Model
    const deletedFolders = await Folder.find({ isDeleted: true }).lean();
    const deletedFiles = await Document.find({ isDeleted: true }).lean();
    const deletedNews = await News.find({ isDeleted: true }).lean();
    const deletedActivities = await Activity.find({ isDeleted: true }).lean();

    // 2. จัด Format ข้อมูลให้อยู่ในรูปแบบเดียวกัน (พร้อมเพิ่ม 'type' และ 'name')
    const formattedFolders = deletedFolders.map(item => ({
      _id: item._id,
      name: item.name, 
      type: 'folder', 
      deletedAt: item.deletedAt
    }));

    const formattedFiles = deletedFiles.map(item => ({
      _id: item._id,
      name: item.originalFilename, 
      type: 'file',
      deletedAt: item.deletedAt
    }));

    const formattedNews = deletedNews.map(item => ({
      _id: item._id,
      name: item.title, 
      type: 'news',
      deletedAt: item.deletedAt
    }));

    const formattedActivities = deletedActivities.map(item => ({
      _id: item._id,
      name: item.title, 
      type: 'activity',
      deletedAt: item.deletedAt
    }));

    // 3. รวมเป็น Array เดียว
    const allItems = [
      ...formattedFolders,
      ...formattedFiles,
      ...formattedNews,
      ...formattedActivities
    ];

    // 4. เรียงลำดับตามวันที่ลบล่าสุด
    allItems.sort((a, b) => b.deletedAt - a.deletedAt);

    // ⭐️ [FIXED] ส่ง Array เดียวกลับไป
    res.json(allItems); 

  } catch (err) {
    console.error("Error in getTrashItems (Backend):", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 2. กู้คืน (รองรับ 4 ประเภท) ---
export const restoreItem = async (req, res) => {
  try {
    const { id, type } = req.body;
    const restoreInfo = {
      isDeleted: false,
      deletedAt: null
    };

    let Model;
    switch (type) {
      case 'file':     Model = Document; break;
      case 'folder':   Model = Folder;   break;
      case 'news':     Model = News;     break;
      case 'activity': Model = Activity; break;
      default:
        return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
    
    await Model.findByIdAndUpdate(id, restoreInfo);
    res.json({ message: `กู้คืน ${type} สำเร็จ` });

  } catch (err) {
    console.error("Error in restoreItem:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- 3. ลบถาวร (รองรับ 4 ประเภท) ---
export const deleteItemPermanently = async (req, res) => {
  try {
    const { id, type } = req.body;
    let item;

    switch (type) {
      case 'file':
        item = await Document.findById(id);
        if (item) {
          if (item.path) { 
            const filePath = path.join(__dirname, '../', item.path.substring(1));
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
          await Document.findByIdAndDelete(id);
        }
        res.json({ message: 'ลบไฟล์ถาวรสำเร็จ' });
        break;

      case 'folder':
        const subFolders = await Folder.countDocuments({ parentId: id });
        const filesInFolder = await Document.countDocuments({ folderId: id });

        if (subFolders > 0 || filesInFolder > 0) {
          return res.status(400).json({ message: 'ไม่สามารถลบถาวรได้ โฟลเดอร์นี้ยังไม่ว่าง' });
        }
        
        await Folder.findByIdAndDelete(id);
        res.json({ message: 'ลบโฟลเดอร์ถาวรสำเร็จ' });
        break;

      case 'news':
        item = await News.findById(id);
        if (item) {
          if (item.imageUrl) {
            const imgPath = path.join(__dirname, '../', item.imageUrl.substring(1));
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
          }
          await News.findByIdAndDelete(id);
        }
        res.json({ message: 'ลบข่าวถาวรสำเร็จ' });
        break;

      case 'activity':
        item = await Activity.findById(id);
        if (item) {
          if (item.imageUrl) {
            const imgPath = path.join(__dirname, '../', item.imageUrl.substring(1));
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
          }
          await Activity.findByIdAndDelete(id);
        }
        res.json({ message: 'ลบกิจกรรมถาวรสำเร็จ' });
        break;

      default:
        return res.status(400).json({ message: 'ประเภทไม่ถูกต้อง' });
    }
  } catch (err) {
    console.error("Error in deleteItemPermanently:", err);
    res.status(500).json({ error: "Server error" });
  }
};