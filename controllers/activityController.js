// controllers/activityController.js (Updated for Soft Delete)

import Activity from "../models/activityModel.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Public
export const getPublicActivities = async (req, res) => {
  try {
    // 👇 [แก้ไข] กรองเฉพาะรายการที่ยังไม่ถูกลบ
    const activities = await Activity.find({ isDeleted: false }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// Admin
export const getAllActivities = async (req, res) => {
  try {
    // 👇 [แก้ไข] กรองเฉพาะรายการที่ยังไม่ถูกลบ
    const activities = await Activity.find({ isDeleted: false }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID กิจกรรมไม่ถูกต้อง" });
    
    // 👇 [แก้ไข] ตรวจสอบว่าถูกลบไปหรือยัง
    const activityItem = await Activity.findOne({ _id: id, isDeleted: false });
    
    if (!activityItem) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้ (หรืออาจอยู่ในถังขยะ)" });
    res.json(activityItem);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ... (createActivity และ updateActivity เหมือนเดิมครับ) ...
export const createActivity = async (req, res) => {
  // (โค้ดเดิมของคุณถูกต้องแล้ว)
  try {
    const { title, date, content } = req.body;
    const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!title || !date || !content) return res.status(400).json({ message: "กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน" });
    const newActivity = new Activity({ title, date: new Date(date), content, imageUrl: imageUrlPath });
    await newActivity.save();
    res.status(201).json({ status: "success", message: "เพิ่มกิจกรรมใหม่สำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์" });
  }
};

export const updateActivity = async (req, res) => {
  // (โค้ดเดิมของคุณถูกต้องแล้ว การลบไฟล์ใน 'update' คือการ 'แทนที่' ไม่ใช่การ 'ลบ')
  try {
    const { id } = req.params;
    const { title, date, content } = req.body;
    let { imageUrl: existingImageUrlFromForm } = req.body;
    if (!title || !date || !content) return res.status(400).json({ message: "กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน" });

    const oldActivity = await Activity.findById(id);
    const updateData = { title, date: new Date(date), content };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      if (oldActivity && oldActivity.imageUrl) {
        const oldImagePath = path.join(process.cwd(), oldActivity.imageUrl.substring(1));
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error(`ไม่สามารถลบไฟล์เก่าได้: ${oldImagePath}`, err.message);
          else console.log(`ลบไฟล์เก่าสำเร็จ: ${oldImagePath}`);
        });
      }
    } else if (existingImageUrlFromForm === "") updateData.imageUrl = "";
    else if (existingImageUrlFromForm) updateData.imageUrl = existingImageUrlFromForm;

    const updatedActivity = await Activity.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    res.json({ status: "success", message: "อัปเดตกิจกรรมสำเร็จ", data: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 👇 [แก้ไขฟังก์ชันนี้ทั้งหมด] ---
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID กิจกรรมไม่ถูกต้อง" });

    // 1. [เปลี่ยน] จาก 'ลบ' เป็น 'อัปเดต'
    const updateInfo = {
      isDeleted: true,
      deletedAt: new Date()
    };
    const deletedActivity = await Activity.findByIdAndUpdate(id, updateInfo);
    
    if (!deletedActivity) return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });

    // 2. [ลบออก] เราจะไม่ลบไฟล์จริง (fs.unlink)
    //    เพราะผู้ใช้ต้องกู้คืนได้

    res.json({ status: "success", message: "ย้ายกิจกรรมไปถังขยะแล้ว" }); // (เปลี่ยนข้อความ)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};