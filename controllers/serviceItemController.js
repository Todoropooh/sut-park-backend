// controllers/serviceItemController.js

const ServiceItem = require('../models/serviceItemModel');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ⭐️⭐️ (เพิ่มใหม่) 1. ฟังก์ชันสำหรับ Public (อ่านอย่างเดียว) ⭐️⭐️
exports.getPublicServiceItems = async (req, res) => {
    try {
        // (เราอาจจะเลือก 'select' เฉพาะบาง field ที่อยากโชว์ก็ได้)
        const items = await ServiceItem.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ---------------------------------------------------
// (ฟังก์ชันเดิมสำหรับ Admin - ไม่ต้องแก้ไข)
// ---------------------------------------------------

// (GET All - Admin)
exports.getAllServiceItems = async (req, res) => {
    try {
        const items = await ServiceItem.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (GET By ID - Admin)
exports.getServiceItemById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ไม่ถูกต้อง' }); }
        const item = await ServiceItem.findById(id);
        if (!item) { return res.status(404).json({ message: 'ไม่พบรายการนี้' }); }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (POST - Create - Admin)
exports.createServiceItem = async (req, res) => {
    const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;
    const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!title || !description || !category) { 
        return res.status(400).json({ message: 'กรุณากรอก หัวข้อ, หมวดหมู่, และรายละเอียด' }); 
    }
    
    try {
        const targetArray = targetAudience ? targetAudience.split(',').map(s => s.trim()) : [];
        const newItem = new ServiceItem({ 
            title, description, category, 
            fundingAmount: Number(fundingAmount) || 0,
            targetAudience: targetArray,
            deadline: deadline ? new Date(deadline) : null,
            imageUrl: imageUrlPath 
        });
        await newItem.save();
        res.status(201).json({ status: 'success', message: `สร้าง "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error creating service item:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// (PUT - Update - Admin)
exports.updateServiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, fundingAmount, targetAudience, deadline } = req.body;
        
        const oldItem = await ServiceItem.findById(id);
        if (!oldItem) return res.status(404).json({ message: 'ไม่พบรายการนี้' });

        const targetArray = targetAudience ? targetAudience.split(',').map(s => s.trim()) : [];
        
        const updateData = { 
            title, description, category, 
            fundingAmount: Number(fundingAmount) || 0,
            targetAudience: targetArray,
            deadline: deadline ? new Date(deadline) : null,
        };
        
        if (req.file) { 
            updateData.imageUrl = `/uploads/${req.file.filename}`; 
            if (oldItem && oldItem.imageUrl) {
                const oldImagePath = path.join(__dirname, '../', oldItem.imageUrl.substring(1)); 
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error(`ไม่สามารถลบไฟล์เก่าได้: ${oldImagePath}`, err.message);
                });
            }
        }
        const updatedItem = await ServiceItem.findByIdAndUpdate( id, updateData, { new: true } );
        res.json({ status: 'success', message: 'อัปเดตสำเร็จ', data: updatedItem });
    } catch (error) {
        console.error('Error updating service item:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (DELETE - Admin)
exports.deleteServiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ไม่ถูกต้อง' }); }
        
        const deletedItem = await ServiceItem.findByIdAndDelete(id);
        if (!deletedItem) { return res.status(404).json({ message: 'ไม่พบรายการนี้' }); }

        if (deletedItem.imageUrl) {
            const imagePath = path.join(__dirname, '../', deletedItem.imageUrl.substring(1));
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`ไม่สามารถลบไฟล์ได้: ${imagePath}`, err.message);
            });
        }
        res.json({ status: 'success', message: 'ลบสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};