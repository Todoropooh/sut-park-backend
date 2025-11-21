import express from 'express';
import * as folderController from '../controllers/folderController.js';

const router = express.Router();

// --- 1. Read (อ่านข้อมูล) ---
// GET /api/folders/contents
router.get('/contents', folderController.getContents);

// GET /api/folders/tree (สำหรับ Sidebar)
router.get('/tree', folderController.getFolderTree);

// --- 2. Create (สร้าง) ---
// POST /api/folders (แก้จาก /create เป็น / เฉยๆ ตามมาตรฐาน REST)
router.post('/', folderController.createFolder);

// --- 3. Update (แก้ไข) ---
// PUT /api/folders/rename (แก้จาก POST เป็น PUT)
router.put('/rename', folderController.renameItem);

// PUT /api/folders/move (แก้จาก POST เป็น PUT)
router.put('/move', folderController.moveItem);

// --- 4. Delete (ลบ) ---
// DELETE /api/folders/:id (แก้จาก POST /delete เป็น DELETE /:id)
router.delete('/:id', folderController.deleteItem);

// (Optional) Copy
router.post('/copy', folderController.copyItem);

export default router;