const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true },       // ชื่อการกระทำ เช่น "Update KPI"
  detail: { type: String },                       // รายละเอียด เช่น "Changed income to 5M"
  by: { type: String, required: true },           // ชื่อคนทำ (username)
  role: { type: String, default: 'Admin' },       // Role คนทำ
  timestamp: { type: Date, default: Date.now }    // เวลาที่ทำ
});

module.exports = mongoose.model('Log', LogSchema);