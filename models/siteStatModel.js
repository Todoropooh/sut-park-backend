// models/siteStatModel.js

const mongoose = require('mongoose');

const siteStatSchema = new mongoose.Schema({
  // ⭐️ (เช่น 'totalPageViews', 'monthlyVisits')
  name: { 
    type: String, 
    required: true, 
    unique: true,
    index: true // ⭐️ (เพิ่ม index เพื่อให้ค้นหาเร็ว)
  },
  count: { 
    type: Number, 
    default: 0 
  },
});

module.exports = mongoose.model('SiteStat', siteStatSchema);