// controllers/serviceItemController.js

import ServiceItem from '../models/serviceItemModel.js';

// --- Get All (Public) ---
export const getPublicServiceItems = async (req, res) => {
  try {
    const services = await ServiceItem.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Get All (Admin) ---
export const getServiceItems = async (req, res) => {
    try {
      const services = await ServiceItem.find({ isDeleted: false }).sort({ createdAt: -1 });
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// --- Create ---
export const createServiceItem = async (req, res) => {
  try {
    const { title, description, link, startDate, endDate, rewardAmount, category } = req.body;
    
    // ⭐️ [Cloudinary] รับ URL รูปภาพโดยตรงจาก req.file.path
    const imageUrl = req.file ? req.file.path : null;

    const newService = new ServiceItem({
      title,
      description,
      imageUrl, // เก็บ URL ของ Cloudinary (https://...)
      category: category || 'ทั่วไป',
      link: link || '',
      startDate: startDate || null,
      endDate: endDate || null,
      rewardAmount: rewardAmount || 0,
      isDeleted: false,
      deletedAt: null
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างบริการ" });
  }
};

// --- Update ---
export const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, startDate, endDate, rewardAmount, category } = req.body;
    
    const updateData = { 
      title, 
      description, 
      link: link || '',
      category: category || 'ทั่วไป',
      startDate: startDate || null,
      endDate: endDate || null,
      rewardAmount: rewardAmount || 0,
    };

    // ⭐️ [Cloudinary] ถ้ามีรูปใหม่มา ใช้ URL ใหม่ได้เลย
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedService = await ServiceItem.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedService);

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไข" });
  }
};

// --- Delete (Soft Delete) ---
export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft Delete (ย้ายไปถังขยะ)
    const updatedService = await ServiceItem.findByIdAndUpdate(
      id, 
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedService) return res.status(404).json({ message: "ไม่พบบริการ" });

    res.json({ message: "ย้ายบริการไปถังขยะแล้ว" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};