import express from 'express';
import { getStats, updateStats } from '../controllers/statisticController.js'; // 🟢 ต้องมี .js

const router = express.Router();

router.get('/', getStats);
router.put('/update', updateStats);

export default router;