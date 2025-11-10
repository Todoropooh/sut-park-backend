// controllers/contactController.js

const Contact = require('../models/contactModel'); // (เราจะสร้างไฟล์นี้)
const mongoose = require('mongoose');

// (ย้ายมาจาก POST /submit-form)
exports.createPublicContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email) { return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมล' }); }
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ status: 'success', message: 'ได้รับข้อมูลติดต่อของคุณแล้ว' });
    } catch (error) {
        console.error('Error /submit-form:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};

// (ย้ายมาจาก GET /api/contacts)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ submittedAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก GET /api/contacts/:id)
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
        const contactItem = await Contact.findById(id);
        if (!contactItem) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
        res.json(contactItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก PATCH /api/contacts/:id/read)
exports.updateContactReadStatus = async (req, res) => {
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
        console.error('Error /api/contacts/:id/read PATCH:', error);
        res.status(500).json({ message: error.message });
    }
};

// (ย้ายมาจาก DELETE /api/contacts/:id)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
        res.json({ status: 'success', message: 'ลบข้อมูลติดต่อสำเร็จ' });
    } catch (error) {
        console.error('Error /api/contacts/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};