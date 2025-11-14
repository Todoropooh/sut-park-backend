// routes/documentRoutes.js

const express = require('express');
const router = express.Router();

const { documentUpload } = require('../middleware/uploadMiddleware'); // ⭐️ ใช้ตัวอัปโหลดเอกสาร
const documentController = require('../controllers/documentController');

// (Path '/' ที่นี่ หมายถึง '/api/documents')

router.post('/upload', documentUpload.single('documentFile'), documentController.uploadDocument);
router.get('/', documentController.getAllDocuments);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.downloadDocument);

export default router;