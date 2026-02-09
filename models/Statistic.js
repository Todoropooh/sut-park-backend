// backend/models/Statistic.js
const mongoose = require('mongoose');

const StatisticSchema = new mongoose.Schema({
  employment: { type: Number, default: 0 },      // การจ้างงาน
  smes: { type: Number, default: 0 },            // ผู้ประกอบการ
  enrollment: { type: Number, default: 0 },      // ผู้เข้าร่วม
  products: { type: Number, default: 0 },        // ผลิตภัณฑ์
  income: { type: Number, default: 0 },          // รายได้
  awards: { type: Number, default: 0 }           // รางวัล
}, { timestamps: true });

module.exports = mongoose.model('Statistic', StatisticSchema);