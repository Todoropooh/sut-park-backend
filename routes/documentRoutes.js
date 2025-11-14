// routes/documentRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import { ... }'
import { documentUpload } from '../middleware/uploadMiddleware.js';
// 3. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as documentController from '../controllers/documentController.js';

// (Path '/' ที่นี่ หมายถึง '/api/documents')

router.post('/upload', documentUpload.single('documentFile'), documentController.uploadDocument);
router.get('/', documentController.getAllDocuments);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.downloadDocument);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)