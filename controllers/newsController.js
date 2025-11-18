// controllers/newsController.js (Updated for Soft Delete)

import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// (Fix __dirname ของคุณถูกต้องแล้ว)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPublicNews = async (req, res) => {
    try {
        SiteStat.findOneAndUpdate(
            { name: 'totalPageViews' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        ).exec(); 

        // 👇 [แก้ไข] กรองเฉพาะข่าวที่ยังไม่ถูกลบ
        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const getAllNews = async (req, res) => {
    try {
        // 👇 [แก้ไข] กรองเฉพาะข่าวที่ยังไม่ถูกลบ
        const news = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        // 👇 [แก้ไข] ค้นหาเฉพาะข่าวที่ยังไม่ถูกลบ
        const newsItem = await News.findOne({ _id: id, isDeleted: false });

        if (!newsItem) { return res.status(404).json({ message: 'ไม่พบข่าวนี้ (หรืออาจอยู่ในถังขยะ)' }); }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (createNews ไม่ต้องแก้ไข)
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

// (updateNews ไม่ต้องแก้ไข)
// (การลบไฟล์เก่าใน 'update' ถูกต้องแล้ว เพราะคือการ 'แทนที่' ไม่ใช่การ 'ลบ')
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

// --- 👇 [แก้ไขฟังก์ชันนี้ทั้งหมด] ---
export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        // 1. [เปลี่ยน] จาก 'ลบ' เป็น 'อัปเดต'
        const updateInfo = {
            isDeleted: true,
            deletedAt: new Date()
        };
        const deletedNews = await News.findByIdAndUpdate(id, updateInfo);

        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        // 2. [ลบออก] เราจะไม่ลบไฟล์จริง (fs.unlink)
        //    เพื่อให้สามารถกู้คืนได้
        /*
        if (deletedNews.imageUrl) {
            const imagePath = path.join(__dirname, '../', deletedNews.imageUrl.substring(1));
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`ไม่สามารถลบไฟล์ข่าวได้: ${imagePath}`, err.message);
                else console.log(`ลบไฟล์ข่าวสำเร็จ: ${imagePath}`);
            });
        }
        */

        // 3. [เปลี่ยน] ข้อความตอบกลับ
        res.json({ status: 'success', message: 'ย้ายข่าวไปถังขยะแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};