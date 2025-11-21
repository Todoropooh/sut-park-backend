// routes/contactRoutes.js

import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

router.get('/', contactController.getAllContacts);
router.get('/unread-count', contactController.getUnreadCount); // ⭐️ สำหรับตัวเลขแดงๆ บนเมนู
router.delete('/:id', contactController.deleteContact);
router.patch('/:id', contactController.updateContact); // หรือ put ก็ได้

export default router;