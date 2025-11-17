// routes/folderRoutes.js (แก้ไขแล้ว)

import express from 'express';
import * as folderController from '../controllers/folderController.js';

const router = express.Router();

// ⭐️ (เส้นทางหลัก) ดึงข้อมูลทั้งหมดในโฟลเดอร์
router.get('/contents', folderController.getContents);

// ⭐️⭐️⭐️ (นี่คือเส้นทางที่เพิ่มเข้ามาใหม่ครับ) ⭐️⭐️⭐️
// ⭐️ ดึงข้อมูล Tree View (สำหรับ Sidebar)
router.get('/tree', folderController.getFolderTree);

// ⭐️ สร้างโฟลเดอร์ใหม่
router.post('/create', folderController.createFolder);

// ⭐️ เปลี่ยนชื่อ (ไฟล์ หรือ โฟลเดอร์)
router.post('/rename', folderController.renameItem);

// ⭐️ ลบ (Soft Delete)
router.post('/delete', folderController.deleteItem);

// ⭐️ ย้าย (ไฟล์ หรือ โฟลเดอร์)
router.post('/move', folderController.moveItem);

// ⭐️ คัดลอก (ไฟล์ หรือ โฟลเดอร์)
router.post('/copy', folderController.copyItem);

export default router;