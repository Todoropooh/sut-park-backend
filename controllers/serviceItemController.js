// controllers/serviceItemController.js

import ServiceItem from '../models/serviceItemModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Get All (Public) ---
export const getPublicServiceItems = async (req, res) => {
  try {
    const services = await ServiceItem.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Get All (Admin) ---
export const getServiceItems = async (req, res) => {
    try {
      const services = await ServiceItem.find().sort({ createdAt: -1 });
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// --- Create ---
export const createServiceItem = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    
    // ⭐️ ถ้ามีไฟล์ ให้เก็บ Path (ระวังเรื่อง slash / หรือ \)
    // บน Windows path อาจจะเป็น uploads\services\file.jpg ต้องแปลงเป็น /
    const imageUrl = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

    const newService = new ServiceItem({
      title,
      description,
      link,
      imageUrl, 
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
    const { title, description, link } = req.body;
    
    const oldService = await ServiceItem.findById(id);
    if (!oldService) return res.status(404).json({ message: "ไม่พบบริการ" });

    const updateData = { title, description, link };

    // ⭐️ ถ้ามีการอัปโหลดไฟล์ใหม่
    if (req.file) {
      updateData.imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;

      // ลบไฟล์เก่าทิ้ง
      if (oldService.imageUrl) {
        // ตัด '/' ตัวแรกออก เพื่อให้ path ถูกต้องเมื่อใช้กับ fs (เช่น uploads/services/...)
        const oldPathRelative = oldService.imageUrl.startsWith('/') ? oldService.imageUrl.substring(1) : oldService.imageUrl;
        const oldPathAbsolute = path.join(process.cwd(), oldPathRelative);

        if (fs.existsSync(oldPathAbsolute)) { 
             fs.unlink(oldPathAbsolute, (err) => {
                if(err) console.log("Failed to delete old image:", err);
             }); 
        }
      }
    }

    const updatedService = await ServiceItem.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedService);

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไข" });
  }
};

// --- Delete ---
export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceItem.findByIdAndDelete(id);
    
    if (!service) return res.status(404).json({ message: "ไม่พบบริการ" });

    if (service.imageUrl) {
      const oldPathRelative = service.imageUrl.startsWith('/') ? service.imageUrl.substring(1) : service.imageUrl;
      const filePath = path.join(process.cwd(), oldPathRelative);
      
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    res.json({ message: "ลบบริการสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};