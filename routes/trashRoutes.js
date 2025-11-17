// routes/trashRoutes.js (New File)

import express from 'express';
import * as trashController from '../controllers/trashController.js';

const router = express.Router();

// ⭐️ Get all items in the trash
// GET /api/trash
router.get('/', trashController.getTrashItems);

// ⭐️ Restore an item (file or folder)
// POST /api/trash/restore
router.post('/restore', trashController.restoreItem);

// ⭐️ Delete an item permanently (file or folder)
// POST /api/trash/delete-permanent
router.post('/delete-permanent', trashController.deleteItemPermanently);

export default router;