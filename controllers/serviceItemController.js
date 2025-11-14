// controllers/serviceItemController.js (Corrected ESM)

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
    const { title, description, targetAudience } = req.body; // targetAudience คือ Array อยู่แล้ว

    const item = new ServiceItem({
      title,
      description,
      // ⭐️ (แก้ไข) ลบ .split() ออก เพราะ Frontend ส่งมาเป็น Array อยู่แล้ว
      targetAudience: targetAudience || [], 
      imageUrl: req.file ? `/uploads/services/${req.file.filename}` : null,
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
    const { title, description, targetAudience } = req.body; // targetAudience คือ Array อยู่แล้ว

    const updateData = {
      title,
      description,
      // ⭐️ (แก้ไข) ลบ .split() ออก (นี่คือบรรทัด 56 ที่ Error)
      targetAudience: targetAudience || [],
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