// models/bookingModel.js

const mongoose = require('mongoose');

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

module.exports = mongoose.model('Booking', bookingSchema);