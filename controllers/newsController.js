// controllers/newsController.js

import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js';
import mongoose from 'mongoose';

// --- Public Get ---
export const getPublicNews = async (req, res) => {
    try {
        SiteStat.findOneAndUpdate(
            { name: 'totalPageViews' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        ).exec(); 

        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// --- Admin Get All ---
export const getAllNews = async (req, res) => {
    try {
        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
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

// --- Create ---
export const createNews = async (req, res) => {
    const { title, category, content, startDate, endDate } = req.body;
    
    // ⭐️ [Cloudinary] รับ URL จาก req.file.path
    const imageUrl = req.file ? req.file.path : null;
    
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    
    try {
        const newNewsItem = new News({ 
            title, category: category || 'ทั่วไป', content, 
            imageUrl, // บันทึก URL เต็มๆ
            publishedAt: new Date(),
            startDate: startDate || null,
            endDate: endDate || null,
            isDeleted: false,
            deletedAt: null
        });
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// --- Update ---
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, startDate, endDate } = req.body;
        
        const oldNews = await News.findById(id);
        if (!oldNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        
        const updateData = { 
            title, category: category || 'ทั่วไป', content,
            startDate: startDate || null,
            endDate: endDate || null
        };
        
        // ⭐️ ถ้ามีรูปใหม่ ใช้ URL จาก Cloudinary เลย
        if (req.file) { 
            updateData.imageUrl = req.file.path;
        }
        
        const updatedNews = await News.findByIdAndUpdate( id, updateData, { new: true } );
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// --- Delete (Soft Delete) ---
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        const deletedNews = await News.findByIdAndUpdate(
            id, 
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        res.json({ status: 'success', message: 'ย้ายข่าวไปถังขยะแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};