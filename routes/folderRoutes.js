// routes/folderRoutes.js (ไฟล์ใหม่)

import express from 'express';
import * as folderController from '../controllers/folderController.js';

const router = express.Router();

// ⭐️ (เส้นทางหลัก) ดึงข้อมูลทั้งหมดในโฟลเดอร์ (รวม Breadcrumbs)
// GET /api/folders/contents?folderId=...
router.get('/contents', folderController.getContents);

// ⭐️ สร้างโฟลเดอร์ใหม่
// POST /api/folders/create
router.post('/create', folderController.createFolder);

// ⭐️ เปลี่ยนชื่อ (ไฟล์ หรือ โฟลเดอร์)
// POST /api/folders/rename
router.post('/rename', folderController.renameItem);

// ⭐️ ลบ (ไฟล์ หรือ โฟลเดอร์)
// POST /api/folders/delete
// (เราใช้ POST แทน DELETE เพื่อให้ส่ง 'type' ใน body ได้ง่าย)
router.post('/delete', folderController.deleteItem);

export default router;