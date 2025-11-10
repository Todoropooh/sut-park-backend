// routes/newsRoutes.js

const express = require('express');
const router = express.Router();

// 1. นำเข้า "ยาม" (เราไม่ต้องใช้ เพราะ server.js จะคุม)
// const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// 2. นำเข้า "ตัวอัปโหลด"
const { upload } = require('../middleware/uploadMiddleware');

// 3. นำเข้า "สมอง"
const newsController = require('../controllers/newsController');

// --- API Routes (Admin) ---
// (หมายเหตุ: server.js จะใส่ "ยาม" ให้กับ router นี้ทั้งก้อน)
// (Path '/' ที่นี่ จึงหมายถึง '/api/news')

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', upload.single('imageUrl'), newsController.createNews); // ⭐️ ใช้ตัวอัปโหลด
router.put('/:id', upload.single('imageUrl'), newsController.updateNews); // ⭐️ ใช้ตัวอัปโหลด
router.delete('/:id', newsController.deleteNews);

module.exports = router;