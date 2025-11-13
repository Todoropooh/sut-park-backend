// controllers/dashboardController.js

const News = require('../models/newsModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const SiteStat = require('../models/siteStatModel'); // 1. ⭐️ (เพิ่ม) นำเข้า Model ใหม่
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
    console.log("กำลังดึงข้อมูล /api/dashboard/stats (ยืนยันสิทธิ์แล้ว)"); 
    const filter = req.query.filter || 'month';
    let groupingId, sortCriteria, labelFormat;

    // (Logic 'switch (filter)' ... เหมือนเดิม)
    switch (filter) {
        case 'day':
            groupingId = { day: { $dayOfMonth: "$bookingDate" }, month: { $month: "$bookingDate" }, year: { $year: "$bookingDate" } };
            sortCriteria = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
            labelFormat = { $dateToString: { format: "%d/%m/%Y", date: { $dateFromParts: { 'year': "$_id.year", 'month': "$_id.month", 'day': "$_id.day" } }, timezone: "+07:00" } };
            break;
        case 'year':
            groupingId = { year: { $year: "$bookingDate" } }; sortCriteria = { "_id.year": 1 }; labelFormat = { $toString: "$_id.year" }; 
            break;
        case 'month':
        default:
            groupingId = { month: { $month: "$bookingDate" }, year: { $year: "$bookingDate" } };
            sortCriteria = { "_id.year": 1, "_id.month": 1 };
            labelFormat = { $concat: [ { $toString: "$_id.month" }, "/", { $toString: "$_id.year" } ] };
            break;
    }

    try {
        // 2. ⭐️ (แก้ไข) เพิ่ม 'SiteStat.findOne'
        const [
            newsCount, 
            bookingCount, 
            userCount, 
            activityCount, 
            pageViewsStat // ⭐️ (ตัวแปรใหม่)
        ] = await Promise.all([
            News.countDocuments(), 
            Booking.countDocuments(), 
            User.countDocuments(), 
            Activity.countDocuments(),
            SiteStat.findOne({ name: 'totalPageViews' }) // ⭐️ (ดึงยอดรวม)
        ]);
        
        // (Logic 'bookingAgg', 'newsAgg' ... เหมือนเดิม)
        const bookingAgg = await Booking.aggregate([
            { $group: { _id: groupingId, count: { $sum: 1 } } }, { $sort: sortCriteria }, 
            { $project: { _id: 0, label: labelFormat, count: 1 } }
        ]);
        const bookingChartData = { labels: bookingAgg.map(item => item.label), data: bookingAgg.map(item => item.count) };
        const newsAgg = await News.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { _id: 1 } }
        ]);
        const newsChartData = { labels: newsAgg.map(item => item._id || 'ทั่วไป'), data: newsAgg.map(item => item.count) };

        // 3. ⭐️ (แก้ไข) เพิ่ม 'pageViewsTotal' เข้าไปใน JSON
        res.json({
            newsTotal: newsCount, 
            bookingsTotal: bookingCount, 
            usersTotal: userCount, 
            activitiesTotal: activityCount, 
            pageViewsTotal: pageViewsStat ? pageViewsStat.count : 0, // ⭐️ (ส่งยอดรวม)
            bookingChartData: bookingChartData, 
            newsChartData: newsChartData
        });
    } catch (error) {
        console.error('Server Error /api/dashboard-stats:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์' });
    }
};