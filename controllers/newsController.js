// controllers/newsController.js

const News = require('../models/newsModel'); // (เราจะสร้างไฟล์นี้)
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// (ย้ายมาจาก GET /public/news)
exports.getPublicNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก GET /api/news)
exports.getAllNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก GET /api/news/:id)
exports.getNewsById = async (req, res) => {
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

// (ย้ายมาจาก POST /api/add-news)
exports.createNews = async (req, res) => {
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

// (ย้ายมาจาก PUT /api/news/:id)
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;
        if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหา' }); }

        const oldNews = await News.findById(id);
        const updateData = { title, category: category || 'ทั่วไป', content };
        
        if (req.file) { 
            updateData.imageUrl = `/uploads/${req.file.filename}`; 
            if (oldNews && oldNews.imageUrl) {
                // ⭐️ (สำคัญ) แก้ Path ให้ออกไป 1 ชั้น (../)
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

// (ย้ายมาจาก DELETE /api/news/:id)
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }

        if (deletedNews.imageUrl) {
            // ⭐️ (สำคัญ) แก้ Path
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