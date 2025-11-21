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
    // ⭐️ [FIXED] กรองเอาเฉพาะที่ยังไม่ถูกลบ (isDeleted: false)
    const services = await ServiceItem.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Get All (Admin) ---
export const getServiceItems = async (req, res) => {
    try {
      // ⭐️ [FIXED] กรองเอาเฉพาะที่ยังไม่ถูกลบ
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
    
    const imageUrl = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

    const newService = new ServiceItem({
      title,
      description,
      imageUrl,
      category: category || 'ทั่วไป',
      link: link || '',
      startDate: startDate || null,
      endDate: endDate || null,
      rewardAmount: rewardAmount || 0,
      // ⭐️ เพิ่มค่าเริ่มต้น
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
    
    const oldService = await ServiceItem.findById(id);
    if (!oldService) return res.status(404).json({ message: "ไม่พบบริการ" });

    const updateData = { 
      title, 
      description, 
      link: link || '',
      category: category || 'ทั่วไป',
      startDate: startDate || null,
      endDate: endDate || null,
      rewardAmount: rewardAmount || 0,
    };

    if (req.file) {
      updateData.imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;

      // ลบไฟล์เก่า (กรณีแทนที่ไฟล์)
      if (oldService.imageUrl) {
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

// --- Delete (Soft Delete) ---
export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;

    // ⭐️ [FIXED] เปลี่ยนเป็น Soft Delete (ย้ายไปถังขยะ)
    const updatedService = await ServiceItem.findByIdAndUpdate(
      id, 
      {
        isDeleted: true,        // ปักธงว่าลบ
        deletedAt: new Date()   // ลงเวลา
      },
      { new: true }
    );
    
    if (!updatedService) return res.status(404).json({ message: "ไม่พบบริการ" });

    // ❌ [ปิดการลบไฟล์จริง] เพื่อให้กู้คืนได้
    /*
    if (service.imageUrl) {
      const oldPathRelative = service.imageUrl.startsWith('/') ? service.imageUrl.substring(1) : service.imageUrl;
      const filePath = path.join(process.cwd(), oldPathRelative);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }
    */

    res.json({ message: "ย้ายบริการไปถังขยะแล้ว" }); // เปลี่ยนข้อความตอบกลับ

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};