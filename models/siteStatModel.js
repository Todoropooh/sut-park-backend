// models/siteStatModel.js (Corrected ESM)

import mongoose from 'mongoose'; // 1. ⭐️ (แก้ไข) เปลี่ยน 'require'

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

export default mongoose.model('SiteStat', siteStatSchema); // (บรรทัดนี้ถูกต้องแล้ว)