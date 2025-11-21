import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Public Get ---
export const getPublicNews = async (req, res) => {
    try {
        // นับยอดวิว
        SiteStat.findOneAndUpdate(
            { name: 'totalPageViews' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        ).exec(); 

        // ดึงเฉพาะที่ยังไม่ลบ
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
    
    // จัดการ Path รูปภาพ (ถ้ามี)
    const imageUrlPath = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;
    
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    
    try {
        const newNewsItem = new News({ 
            title, 
            category: category || 'ทั่วไป', 
            content, 
            imageUrl: imageUrlPath, 
            publishedAt: new Date(),
            // ⭐️ บันทึกวันที่เริ่ม-จบ
            startDate: startDate || null,
            endDate: endDate || null,
            // ⭐️ ค่าเริ่มต้น Soft Delete
            isDeleted: false,
            deletedAt: null
        });
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error /api/add-news:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// --- Update ---
export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, startDate, endDate } = req.body;
        
        if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหา' }); }

        const oldNews = await News.findById(id);
        if (!oldNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        
        const updateData = { 
            title, 
            category: category || 'ทั่วไป', 
            content,
            // ⭐️ อัปเดตวันที่เริ่ม-จบ
            startDate: startDate || null,
            endDate: endDate || null
        };
        
        // ถ้ามีการอัปโหลดรูปใหม่
        if (req.file) { 
            updateData.imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
            // ลบรูปเก่าทิ้ง
            if (oldNews.imageUrl) {
                const oldPathRelative = oldNews.imageUrl.startsWith('/') ? oldNews.imageUrl.substring(1) : oldNews.imageUrl;
                const oldImagePath = path.join(process.cwd(), oldPathRelative);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, () => {});
                }
            }
        }
        
        const updatedNews = await News.findByIdAndUpdate( id, updateData, { new: true } );
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        console.error('Error /api/news/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// --- Delete (Soft Delete) ---
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        // ⭐️ เปลี่ยนสถานะเป็นลบ (ไม่ลบจริง)
        const updateInfo = {
            isDeleted: true,
            deletedAt: new Date()
        };
        const deletedNews = await News.findByIdAndUpdate(id, updateInfo);

        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        res.json({ status: 'success', message: 'ย้ายข่าวไปถังขยะแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};