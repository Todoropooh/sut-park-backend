// models/bookingModel.js (Corrected ESM)

import mongoose from 'mongoose'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'

const bookingSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, enum: ['morning', 'afternoon'], required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    roomLayout: { type: String },
    equipment: { type: String },
    break: { type: Boolean, default: false },
    details: { type: String },
    room: { type: String, default: 'ห้องประชุม' },
    submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema); // (บรรทัดนี้ถูกต้องแล้ว)