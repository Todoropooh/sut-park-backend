import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

// ✅ เพิ่มรายการใหม่
router.post('/', async (req, res) => {
  try {
    const { title, description, category, fundingAmount, targetAudience, deadline, imageUrl } = req.body;

    const service = await Service.create({
      title,
      description,
      category,
      fundingAmount,
      targetAudience: targetAudience ? targetAudience.split(',').map(s => s.trim()) : [],
      deadline,
      imageUrl, // ใช้ URL จาก frontend (Cloudinary)
    });

    res.status(201).json(service);
  } catch (err) {
    console.error('Service create error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ แก้ไขรายการ
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, fundingAmount, targetAudience, deadline, imageUrl } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        fundingAmount,
        targetAudience: targetAudience ? targetAudience.split(',').map(s => s.trim()) : [],
        deadline,
        imageUrl,
      },
      { new: true }
    );

    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json(service);
  } catch (err) {
    console.error('Service update error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
