// controllers/activityController.js (Updated for Start/End Date & Soft Delete)

import Activity from "../models/activityModel.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Get Public (Active Only) ---
export const getPublicActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isDeleted: false }).sort({ startDate: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Get All Admin (Active Only) ---
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isDeleted: false }).sort({ startDate: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Get By ID ---
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID กิจกรรมไม่ถูกต้อง" });
    const activityItem = await Activity.findOne({ _id: id, isDeleted: false });
    if (!activityItem) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    res.json(activityItem);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Create ---
export const createActivity = async (req, res) => {
  try {
    // ⭐️ [แก้ไข] รับค่า startDate, endDate แทน date
    const { title, content, startDate, endDate } = req.body;
    
    const imageUrlPath = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;

    // ⭐️ [แก้ไข] ตรวจสอบ startDate แทน date
    if (!title || !startDate || !content) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน (หัวข้อ, วันเริ่ม, เนื้อหา)" });
    }

    const newActivity = new Activity({ 
        title, 
        content, 
        imageUrl: imageUrlPath,
        // ⭐️ บันทึกฟิลด์ใหม่ (และรองรับ field เก่า 'date' ด้วย startDate เพื่อความชัวร์)
        date: new Date(startDate), 
        startDate: startDate || null,
        endDate: endDate || null,
        isDeleted: false,
        deletedAt: null
    });

    await newActivity.save();
    res.status(201).json({ status: "success", message: "เพิ่มกิจกรรมใหม่สำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์" });
  }
};

// --- Update ---
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    // ⭐️ [แก้ไข] รับค่าใหม่
    const { title, content, startDate, endDate } = req.body;
    let { imageUrl: existingImageUrlFromForm } = req.body;

    if (!title || !startDate || !content) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน" });
    }

    const oldActivity = await Activity.findById(id);
    
    const updateData = { 
        title, 
        content,
        date: new Date(startDate), // อัปเดต field เก่าด้วย
        startDate: startDate || null,
        endDate: endDate || null
    };

    if (req.file) {
      updateData.imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
      
      // ลบไฟล์เก่า
      if (oldActivity && oldActivity.imageUrl) {
        const oldPathRelative = oldActivity.imageUrl.startsWith('/') ? oldActivity.imageUrl.substring(1) : oldActivity.imageUrl;
        const oldImagePath = path.join(process.cwd(), oldPathRelative);
        if (fs.existsSync(oldImagePath)) {
           fs.unlink(oldImagePath, () => {});
        }
      }
    } else if (existingImageUrlFromForm === "") {
        updateData.imageUrl = "";
    }

    const updatedActivity = await Activity.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    
    res.json({ status: "success", message: "อัปเดตกิจกรรมสำเร็จ", data: updatedActivity });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Delete (Soft Delete) ---
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID กิจกรรมไม่ถูกต้อง" });

    // ⭐️ Soft Delete
    const deletedActivity = await Activity.findByIdAndUpdate(
        id, 
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );

    if (!deletedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });

    res.json({ status: "success", message: "ย้ายกิจกรรมไปถังขยะแล้ว" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};