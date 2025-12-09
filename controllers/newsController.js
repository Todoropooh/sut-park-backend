// src/controllers/newsController.js

import News from '../models/newsModel.js';
import SiteStat from '../models/siteStatModel.js'; 
import mongoose from 'mongoose';

// --- Public Get (คนทั่วไปดู) ---
export const getPublicNews = async (req, res) => {
    try {
        // 1. นับยอดวิว (ใส่ try-catch กันเหนียว)
        try {
            await SiteStat.findOneAndUpdate(
                { name: 'totalPageViews' },
                { $inc: { count: 1 } },
                { upsert: true, new: true }
            );
        } catch (statError) {
            console.warn("SiteStat Error:", statError.message);
        }

        // 2. ดึงข่าวทั้งหมด
        const newsList = await News.find({ isDeleted: false }).sort({ publishedAt: -1 });

        // 3. 🟢 [Modified] แปลงข้อมูลก่อนส่ง เพื่อบอกประเภทไฟล์ให้ Frontend รู้
        const formattedNews = newsList.map(item => {
            const fileUrl = item.imageUrl || '';
            
            // เช็คว่าเป็น PDF หรือไม่?
            const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

            return {
                ...item._doc, // ข้อมูลเดิม (title, content, etc.)
                
                // ⭐️ เพิ่มตัวแปรนี้ให้เพื่อน! Frontend จะได้เขียนเงื่อนไขง่ายๆ
                // ถ้าเป็น 'pdf' ให้โชว์ปุ่มโหลด, ถ้า 'image' ให้โชว์รูป
                fileType: isPdf ? 'pdf' : 'image',
                
                // (แถม) ตัวแปรชื่อชัดเจน
                attachmentUrl: fileUrl
            };
        });

        res.json(formattedNews);

    } catch (error) {
        console.error(error);
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
    
    // ⭐️ [Cloudinary] รับ URL ไฟล์จาก Cloudinary (middleware จัดการให้แล้ว)
    const imageUrl = req.file ? req.file.path : null;
    
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    
    try {
        const newNewsItem = new News({ 
            title, 
            category: category || 'ทั่วไป', 
            content, 
            imageUrl, // URL เต็มๆ จาก Cloudinary
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
        
        // 🟢 FIX: บันทึกคนลบ
        const deletedNews = await News.findByIdAndUpdate(
            id, 
            { 
                isDeleted: true, 
                deletedAt: new Date(),
                deletedBy: req.user ? req.user._id : null // บันทึก ID คนลบ
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