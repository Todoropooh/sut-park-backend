// src/controllers/serviceItemController.js

import Service from '../models/serviceItemModel.js'; // 🟢 แก้ชื่อไฟล์ให้ตรงแล้ว
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Get All (Public) ---
export const getServiceItems = async (req, res) => {
  try {
    const services = await Service.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// --- 2. Get By ID ---
export const getServiceItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID ไม่ถูกต้อง" });
    }
    
    const service = await Service.findOne({ _id: id, isDeleted: false });
    
    if (!service) {
        return res.status(404).json({ message: "ไม่พบข้อมูลบริการนี้" });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 3. Create ---
export const createServiceItem = async (req, res) => {
  try {
    const { title, category, description, startDate, endDate, rewardAmount, link } = req.body;
    
    // รับ URL รูปจาก Cloudinary
    const imageUrl = req.file ? req.file.path : null;

    if (!title) {
        return res.status(400).json({ message: "กรุณากรอกชื่อบริการ/ทุน" });
    }

    const newService = new Service({ 
        title, 
        category: category || 'ทั่วไป',
        description,
        imageUrl,
        startDate: startDate || null,
        endDate: endDate || null,
        rewardAmount: rewardAmount || 0,
        link: link || '',
        isDeleted: false,
        deletedAt: null
    });

    await newService.save();
    res.status(201).json({ status: "success", message: "เพิ่มข้อมูลสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์" });
  }
};

// --- 4. Update ---
export const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, startDate, endDate, rewardAmount, link } = req.body;

    const updateData = { 
        title, category, description, 
        startDate: startDate || null,
        endDate: endDate || null,
        rewardAmount: rewardAmount || 0,
        link: link || ''
    };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedService) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    
    res.json({ status: "success", message: "อัปเดตข้อมูลสำเร็จ", data: updatedService });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 5. Delete (Soft Delete) ---
export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedService = await Service.findByIdAndUpdate(
        id, 
        { 
            isDeleted: true, 
            deletedAt: new Date(),
            deletedBy: req.user ? req.user._id : null 
        },
        { new: true }
    );

    if (!deletedService) return res.status(404).json({ message: "ไม่พบข้อมูล" });

    res.json({ status: "success", message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};