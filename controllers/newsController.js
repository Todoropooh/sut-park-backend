// controllers/newsController.js (Corrected ESM)

// 1. ⭐️ (แก้ไข) เปลี่ยน 'require' ทั้งหมดเป็น 'import'
import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url'; // ⭐️ (เพิ่ม) สำหรับแก้ __dirname

// 2. ⭐️ (เพิ่ม) Fix __dirname ที่ไม่รองรับใน ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. ⭐️ (แก้ไข) เปลี่ยน 'exports.getPublicNews' เป็น 'export const getPublicNews'
export const getPublicNews = async (req, res) => {
    try {
        SiteStat.findOneAndUpdate(
            { name: 'totalPageViews' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        ).exec(); 

        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// 4. ⭐️ (แก้ไข) เพิ่ม 'export const' หน้าฟังก์ชันที่เหลือทั้งหมด
export const getAllNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        const newsItem = await News.findById(id);
        if (!newsItem) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const createNews = async (req, res) => {
    const { title, category, content } = req.body;
    const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    try {
        const newNewsItem = new News({ title, category: category || 'ทั่วไป', content, imageUrl: imageUrlPath, publishedAt: new Date() });
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error /api/add-news:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;
        if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหา' }); }

        const oldNews = await News.findById(id);
        const updateData = { title, category: category || 'ทั่วไป', content };
        
        if (req.file) { 
            updateData.imageUrl = `/uploads/${req.file.filename}`; 
            if (oldNews && oldNews.imageUrl) {
                // (โค้ดส่วนนี้จะทำงานได้เพราะเราแก้ __dirname แล้ว)
                const oldImagePath = path.join(__dirname, '../', oldNews.imageUrl.substring(1)); 
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error(`ไม่สามารถลบไฟล์เก่าได้: ${oldImagePath}`, err.message);
                    else console.log(`ลบไฟล์เก่าสำเร็จ: ${oldImagePath}`);
                });
            }
        }
        const updatedNews = await News.findByIdAndUpdate( id, updateData, { new: true } );
        if (!updatedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        console.error('Error /api/news/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        if (deletedNews.imageUrl) {
            // (โค้ดส่วนนี้จะทำงานได้เพราะเราแก้ __dirname แล้ว)
            const imagePath = path.join(__dirname, '../', deletedNews.imageUrl.substring(1));
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`ไม่สามารถลบไฟล์ข่าวได้: ${imagePath}`, err.message);
                else console.log(`ลบไฟล์ข่าวสำเร็จ: ${imagePath}`);
            });
        }
        res.json({ status: 'success', message: 'ลบข่าวสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};