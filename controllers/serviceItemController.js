import ServiceItem from "../models/ServiceItem.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// สร้าง Service Item
export const createServiceItem = async (req, res) => {
  try {
    const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;
    let imageUrl = "";

    // Upload รูปถ้ามี
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "sut-park" });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // ลบไฟล์ temp
    }

    const newItem = new ServiceItem({
      title,
      description,
      category,
      fundingAmount: fundingAmount || 0,
      targetAudience: targetAudience ? targetAudience.split(",").map(t => t.trim()) : [],
      deadline: deadline ? new Date(deadline) : null,
      imageUrl,
    });

    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error("Create ServiceItem error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// แก้ไข Service Item
export const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;

    const item = await ServiceItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "ไม่พบรายการนี้" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "sut-park" });
      item.imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    item.title = title;
    item.description = description;
    item.category = category;
    item.fundingAmount = fundingAmount || 0;
    item.targetAudience = targetAudience ? targetAudience.split(",").map(t => t.trim()) : [];
    item.deadline = deadline ? new Date(deadline) : null;

    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("Update ServiceItem error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ดึง Service Item ทั้งหมด (Public)
export const getPublicServiceItems = async (req, res) => {
  try {
    const items = await ServiceItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Get ServiceItems error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ลบ Service Item
export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ServiceItem.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, message: "ไม่พบรายการนี้" });
    res.json({ success: true, message: "ลบรายการสำเร็จ" });
  } catch (err) {
    console.error("Delete ServiceItem error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
