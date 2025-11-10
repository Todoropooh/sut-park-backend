// routes/activityRoutes.js

const express = require('express');
const router = express.Router();

const { upload } = require('../middleware/uploadMiddleware');
const activityController = require('../controllers/activityController');

// (Path '/' ที่นี่ หมายถึง '/api/activities')

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', upload.single('imageUrl'), activityController.createActivity);
router.put('/:id', upload.single('imageUrl'), activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;