// controllers/activityController.js

import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// --- Get Public ---
export const getPublicActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isDeleted: false }).sort({ startDate: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Get All Admin ---
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
    const { title, content, startDate, endDate } = req.body;
    
    // ⭐️ [Cloudinary] รับ URL
    const imageUrl = req.file ? req.file.path : null;

    if (!title || !startDate || !content) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน" });
    }

    const newActivity = new Activity({ 
        title, content, 
        imageUrl, // เก็บ URL
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
    const { title, content, startDate, endDate } = req.body;

    const updateData = { 
        title, content,
        date: new Date(startDate),
        startDate: startDate || null,
        endDate: endDate || null
    };

    // ⭐️ อัปเดต URL รูป
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedActivity = await Activity.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    
    res.json({ status: "success", message: "อัปเดตกิจกรรมสำเร็จ", data: updatedActivity });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- Delete ---
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndUpdate(
        id, 
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );
    if (!deletedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });

    res.json({ status: "success", message: "ย้ายกิจกรรมไปถังขยะแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};