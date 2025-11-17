// controllers/contactController.js (เพิ่ม getUnreadCount)

import Contact from '../models/contactModel.js'; 
import mongoose from 'mongoose'; 

export const createPublicContact = async (req, res) => {
        try {
            const { name, email, message } = req.body;
            if (!name || !email) { return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมล' }); }
            const newContact = new Contact({ name, email, message });
            await newContact.save();
            res.status(201).json({ status: 'success', message: 'ได้รับข้อมูลติดต่อของคุณแล้ว' });
        } catch (error) {
         console.error('Error /submit-form:', error); // (มีอยู่แล้ว)
            res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
        }
};

export const getAllContacts = async (req, res) => {
        try {
            const contacts = await Contact.find({}).sort({ submittedAt: -1 });
            res.json(contacts);
        } catch (error) {
        // ⭐️ (เพิ่ม)
            console.error("Error in getAllContacts:", error); 
            res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

export const getContactById = async (req, res) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
            const contactItem = await Contact.findById(id);
            if (!contactItem) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
            res.json(contactItem);
        } catch (error) {
        // ⭐️ (เพิ่ม)
            console.error("Error in getContactById:", error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
        }
};

export const updateContactReadStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { isRead } = req.body; 
            if (typeof isRead !== 'boolean') {
                return res.status(400).json({ message: 'Invalid isRead value' });
            }
            const contact = await Contact.findByIdAndUpdate(
                id, 
                { isRead }, 
                { new: true } 
        );
            if (!contact) {
                return res.status(404).json({ message: 'Contact not found' });
            }
            res.json(contact); 
        } catch (error) {
         console.error('Error /api/contacts/:id/read PATCH:', error); // (มีอยู่แล้ว)
            res.status(500).json({ message: error.message });
        }
};

export const deleteContact = async (req, res) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
            const deletedContact = await Contact.findByIdAndDelete(id);
            if (!deletedContact) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
            res.json({ status: 'success', message: 'ลบข้อมูลติดต่อสำเร็จ' });
        } catch (error) {
         console.error('Error /api/contacts/:id DELETE:', error); // (มีอยู่แล้ว)
            res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
        }
};

// ⭐️⭐️⭐️ (นี่คือฟังก์ชันที่เพิ่มเข้ามาใหม่ครับ) ⭐️⭐️⭐️
export const getUnreadCount = async (req, res) => {
    try {
    // นับเอกสารทั้งหมดที่ isRead = false
    const count = await Contact.countDocuments({ isRead: false });
    res.json({ count: count });
    } catch (err) {
    // (เพิ่ม console.error ที่เราเคยทำไว้)
    console.error("Error in getUnreadCount:", err);
    res.status(500).json({ error: "Server error" });
    }
};