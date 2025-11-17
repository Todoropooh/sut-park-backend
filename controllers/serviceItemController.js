// controllers/serviceItemController.js (แก้ไขแล้ว)

import ServiceItem from "../models/serviceItemModel.js";

export const getServiceItems = async (req, res) => {
  try {
    const items = await ServiceItem.find();
    res.json(items);
  } catch (err) {
    console.error("Error in getServiceItems:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPublicServiceItems = async (req, res) => {
  try {
    const items = await ServiceItem.find({ isActive: true });
    res.json(items);
  } catch (err) {
    console.error("Error in getPublicServiceItems:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createServiceItem = async (req, res) => {
  try {
    // ⭐️ (แก้ไข) 1. ดึงข้อมูลใหม่จาก body
    const { title, description, targetAudience, startDate, linkUrl } = req.body; 

    const item = new ServiceItem({
      title,
      description,
      targetAudience: targetAudience || [],
      imageUrl: req.file ? `/uploads/services/${req.file.filename}` : null,
      
      // ⭐️ (แก้ไข) 2. เพิ่มข้อมูลใหม่
      startDate: startDate || null,
      linkUrl: linkUrl || null
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Error in createServiceItem:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateServiceItem = async (req, res) => {
  try {
    // ⭐️ (แก้ไข) 1. ดึงข้อมูลใหม่จาก body
    const { title, description, targetAudience, startDate, linkUrl } = req.body;

    const updateData = {
      title,
      description,
      targetAudience: targetAudience || [],

      // ⭐️ (แก้ไข) 2. เพิ่มข้อมูลใหม่
      startDate: startDate || null,
      linkUrl: linkUrl || null
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const updated = await ServiceItem.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updated);
  } catch (err) {
    console.error("Error in updateServiceItem:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteServiceItem = async (req, res) => {
  try {
    await ServiceItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error in deleteServiceItem:", err);
    res.status(500).json({ error: err.message });
  }
};