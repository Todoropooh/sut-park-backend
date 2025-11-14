import Activity from '../models/activityModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export default {
  getPublicActivities: async (req, res) => {
    try {
      const activities = await Activity.find({}).sort({ date: -1 });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  },

  getAllActivities: async (req, res) => {
    try {
      const activities = await Activity.find({}).sort({ date: -1 });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  },

  getActivityById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' });

      const activityItem = await Activity.findById(id);
      if (!activityItem)
        return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });

      res.json(activityItem);
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  },

  createActivity: async (req, res) => {
    try {
      const { title, date, content } = req.body;
      const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;

      if (!title || !date || !content)
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน' });

      const newActivity = new Activity({
        title,
        date: new Date(date),
        content,
        imageUrl: imageUrlPath,
      });

      await newActivity.save();
      res.status(201).json({ status: 'success', message: 'เพิ่มกิจกรรมใหม่สำเร็จ' });
    } catch (error) {
      console.error('Error /api/activities POST:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
  },

  updateActivity: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, date, content } = req.body;
      let { imageUrl: existingImageUrlFromForm } = req.body;

      if (!title || !date || !content)
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน' });

      const oldActivity = await Activity.findById(id);
      const updateData = { title, date: new Date(date), content };

      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
        if (oldActivity && oldActivity.imageUrl) {
          const oldImagePath = path.join(__dirname, '../', oldActivity.imageUrl.substring(1));
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error(`ไม่สามารถลบไฟล์เก่าได้: ${oldImagePath}`, err.message);
            else console.log(`ลบไฟล์เก่าสำเร็จ: ${oldImagePath}`);
          });
        }
      } else if (existingImageUrlFromForm === '') {
        updateData.imageUrl = '';
      } else if (existingImageUrlFromForm) {
        updateData.imageUrl = existingImageUrlFromForm;
      }

      const updatedActivity = await Activity.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedActivity)
        return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });

      res.json({ status: 'success', message: 'อัปเดตกิจกรรมสำเร็จ', data: updatedActivity });
    } catch (error) {
      console.error('Error /api/activities/:id PUT:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  },

  deleteActivity: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' });

      const deletedActivity = await Activity.findByIdAndDelete(id);
      if (!deletedActivity)
        return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });

      if (deletedActivity.imageUrl) {
        const imagePath = path.join(__dirname, '../', deletedActivity.imageUrl.substring(1));
        fs.unlink(imagePath, (err) => {
          if (err) console.error(`ไม่สามารถลบไฟล์กิจกรรมได้: ${imagePath}`, err.message);
          else console.log(`ลบไฟล์กิจกรรมสำเร็จ: ${imagePath}`);
        });
      }

      res.json({ status: 'success', message: 'ลบกิจกรรมสำเร็จ' });
    } catch (error) {
      console.error('Error /api/activities/:id DELETE:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  },
};
