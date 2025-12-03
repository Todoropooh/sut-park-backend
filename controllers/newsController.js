// src/controllers/newsController.js

import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js'; // ต้องมีไฟล์นี้ใน models ด้วยนะครับ
import mongoose from 'mongoose';

// --- Public Get (คนทั่วไปดู) ---
export const getPublicNews = async (req, res) => {
    try {
        // นับยอดวิว (ใส่ try-catch กันเหนียว เผื่อระบบ Stat มีปัญหา ข่าวจะได้ไม่ล่ม)
        try {
            await SiteStat.findOneAndUpdate(
                { name: 'totalPageViews' },
                { $inc: { count: 1 } },
                { upsert: true, new: true }
            );
        } catch (statError) {
            console.warn("SiteStat Error:", statError.message);
        }

        // ดึงเฉพาะข่าวที่ยังไม่ลบ
        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// --- Admin Get All (แอดมินดู) ---
export const getAllNews = async (req, res) => {
    try {
        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// --- Get By ID ---
export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        const newsItem = await News.findOne({ _id: id, isDeleted: false });
        if (!newsItem) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// --- Create (สร้างข่าว + Cloudinary) ---
export const createNews = async (req, res) => {
    const { title, category, content, startDate, endDate } = req.body;
    
    // ⭐️ [Cloudinary] ถ้ามีไฟล์แนบมา req.file.path จะเป็น URL ของรูปบน Cloudinary เลย
    const imageUrl = req.file ? req.file.path : null;
    
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    
    try {
        const newNewsItem = new News({ 
            title, 
            category: category || 'ทั่วไป', 
            content, 
            imageUrl, // บันทึก URL เต็มๆ ที่ได้จาก Cloudinary
            publishedAt: new Date(),
            startDate: startDate || null,
            endDate: endDate || null,
            isDeleted: false,
            deletedAt: null
        });
        
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error in createNews:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// --- Update (แก้ไขข่าว + Cloudinary) ---
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, startDate, endDate } = req.body;
        
        const oldNews = await News.findById(id);
        if (!oldNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        
        const updateData = { 
            title, 
            category: category || 'ทั่วไป', 
            content,
            startDate: startDate || null,
            endDate: endDate || null
        };
        
        // ⭐️ ถ้ามีการอัปโหลดรูปใหม่ (req.file มีค่า) ให้ใช้ URL ใหม่จาก Cloudinary
        if (req.file) { 
            updateData.imageUrl = req.file.path;
        }
        
        const updatedNews = await News.findByIdAndUpdate( id, updateData, { new: true } );
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        console.error('Error in updateNews:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไข' });
    }
};

// --- Delete (Soft Delete + บันทึกคนลบ) ---
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) { 
            return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); 
        }
        
        // 🟢 FIX: เพิ่มการบันทึก deletedBy
        // ต้องแน่ใจว่า Route มี authenticateToken กั้นไว้ เพื่อให้ req.user มีค่า
        const deletedNews = await News.findByIdAndUpdate(
            id, 
            { 
                isDeleted: true, 
                deletedAt: new Date(),
                deletedBy: req.user ? req.user._id : null // 👈 บันทึก ID ของคนที่กดลบ (สำคัญมาก!)
            },
            { new: true }
        );

        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        res.json({ status: 'success', message: 'ย้ายข่าวไปถังขยะแล้ว' });
    } catch (error) {
        console.error('Error in deleteNews:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบ' });
    }
};