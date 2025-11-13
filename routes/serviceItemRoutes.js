// routes/serviceItemRoutes.js

const express = require('express');
const router = express.Router();

// 1. นำเข้า "ตัวอัปโหลด" (เราจะใช้ตัวเดียวกับ News/Activities)
const { upload } = require('../middleware/uploadMiddleware');

// 2. นำเข้า "สมอง"
const serviceItemController = require('../controllers/serviceItemController');

// 3. กำหนดเส้นทาง (ยาม 'authenticateToken' จะถูกเรียกใน server.js)
// (Path '/' ที่นี่ หมายถึง '/api/services')

router.get('/', serviceItemController.getAllServiceItems);
router.get('/:id', serviceItemController.getServiceItemById);
router.post('/', upload.single('imageUrl'), serviceItemController.createServiceItem);
router.put('/:id', upload.single('imageUrl'), serviceItemController.updateServiceItem);
router.delete('/:id', serviceItemController.deleteServiceItem);

module.exports = router;