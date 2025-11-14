// routes/newsRoutes.js (Corrected ESM)

import express from 'express'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'
const router = express.Router();

// (Middleware และ Controller)
// 2. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import { ... }'
import { upload } from '../middleware/uploadMiddleware.js'; 

// 3. ⭐️ (แก้ไข) เปลี่ยน 'require' เป็น 'import * as ...'
import * as newsController from '../controllers/newsController.js';

// --- API Routes (Admin) ---
// (Path '/' ที่นี่ จึงหมายถึง '/api/news')

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', upload.single('imageUrl'), newsController.createNews); 
router.put('/:id', upload.single('imageUrl'), newsController.updateNews); 
router.delete('/:id', newsController.deleteNews);

export default router; // (บรรทัดนี้ถูกต้องแล้ว)