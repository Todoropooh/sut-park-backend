// controllers/bookingController.js

const Booking = require('../models/bookingModel'); // (เราจะสร้างไฟล์นี้)
const mongoose = require('mongoose');

// (ย้ายมาจาก GET /public/bookings)
exports.getPublicBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).select('room bookingDate timeSlot eventName'); 
        const events = bookings.map(b => {
            const dateStr = b.bookingDate.toISOString().split('T')[0];
            let startTime, endTime;
            if (b.timeSlot === 'morning') { startTime = '08:30'; endTime = '12:30'; } 
            else if (b.timeSlot === 'afternoon') { startTime = '13:00'; endTime = '17:00'; } 
            else { return { title: `${b.eventName || b.room} (ไม่ระบุเวลา)`, start: dateStr, color: '#dc3545' }; }
            const startISO = `${dateStr}T${startTime}:00`;
            const endISO = `${dateStr}T${endTime}:00`;
            return { title: `${b.eventName || b.room} (${b.timeSlot === 'morning' ? 'เช้า' : 'บ่าย'})`, start: startISO, end: endISO, color: '#dc3545', display: 'block' };
        });
        res.json(events); 
    } catch (error) {
        console.error('Error /public/bookings:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลปฏิทิน' });
    }
};

// (ย้ายมาจาก GET /api/bookings)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ bookingDate: -1 }); 
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// (ย้ายมาจาก POST /api/bookings)
exports.createBooking = async (req, res) => {
    try {
        const { eventName, bookingDate, timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest, details } = req.body;
        if (!eventName || !bookingDate || !timeSlot || !contactName || !email) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลการจองให้ครบถ้วน' }); }
        const newBooking = new Booking({ room: 'ห้องประชุม', eventName, bookingDate: new Date(bookingDate), timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest || false, details });
        await newBooking.save();
        res.status(201).json({ status: 'success', message: `สร้างการจอง "${eventName}" สำเร็จ`, data: newBooking });
    } catch (error) {
        console.error('Error /api/bookings POST:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์ในการสร้างการจองใหม่' });
    }
};

// (ย้ายมาจาก PUT /api/bookings/:id)
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID การจองไม่ถูกต้อง' }); }
        const { eventName, bookingDate, timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest, details } = req.body;
        if (!eventName || !bookingDate || !timeSlot || !contactName || !email) { return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' }); }
        const updateData = { eventName, bookingDate: new Date(bookingDate), timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest || false, details };
        const updatedBooking = await Booking.findByIdAndUpdate( id, updateData, { new: true } );
        if (!updatedBooking) { return res.status(4404).json({ message: 'ไม่พบการจองนี้' }); }
        res.json({ status: 'success', message: 'อัปเดตการจองสำเร็จ', data: updatedBooking });
    } catch (error) {
        console.error('Error /api/bookings/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตการจอง' });
    }
};

// (ย้ายมาจาก DELETE /api/bookings/:id)
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID การจองไม่ถูกต้อง' }); }
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) { return res.status(404).json({ message: 'ไม่พบรายการจองนี้' }); }
        res.json({ status: 'success', message: 'ลบรายการจองสำเร็จ' });
    } catch (error) {
        console.error('Error /api/bookings/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
};