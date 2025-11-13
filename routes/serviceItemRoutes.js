import ServiceItem from "../models/serviceItemModel.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getPublicServiceItems = async (req, res) => {
  try {
    const items = await ServiceItem.find();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createServiceItem = async (req, res) => {
  try {
    const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "กรุณากรอกหัวข้อ, หมวดหมู่, และรายละเอียด" });
    }

    let targetArray = [];
    if (typeof targetAudience === "string") {
      targetArray = targetAudience.split(",").map(s => s.trim());
    } else if (Array.isArray(targetAudience)) {
      targetArray = targetAudience;
    }

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // ลบไฟล์ temp
    }

    const newItem = new ServiceItem({
      title,
      description,
      category,
      fundingAmount: fundingAmount || 0,
      targetAudience: targetArray,
      deadline: deadline || null,
      imageUrl,
    });

    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;

    const item = await ServiceItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.fundingAmount = fundingAmount ?? item.fundingAmount;
    if (targetAudience) {
      item.targetAudience = typeof targetAudience === "string"
        ? targetAudience.split(",").map(s => s.trim())
        : targetAudience;
    }
    item.deadline = deadline || item.deadline;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      item.imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
