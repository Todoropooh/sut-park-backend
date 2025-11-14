// controllers/dashboardController.js (Corrected ESM)

// 1. ⭐️ (แก้ไข) เปลี่ยน 'require' ทั้งหมดเป็น 'import'
import News from '../models/newsModel.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import Activity from '../models/activityModel.js';
import SiteStat from '../models/siteStatModel.js';
import Document from '../models/documentModel.js';
import ServiceItem from '../models/serviceItemModel.js';
import mongoose from 'mongoose';

// 2. ⭐️ (แก้ไข) เปลี่ยน 'exports.getDashboardStats' เป็น 'export const ...'
export const getDashboardStats = async (req, res) => {
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
        const [
            newsCount, 
            bookingCount, 
            userCount, 
            activityCount, 
            pageViewsStat,
            documentsCount,
            servicesCount
        ] = await Promise.all([
            News.countDocuments(), 
            Booking.countDocuments(), 
            User.countDocuments(), 
            Activity.countDocuments(),
            SiteStat.findOne({ name: 'totalPageViews' }),
            Document.countDocuments(),
            ServiceItem.countDocuments()
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

        res.json({
            newsTotal: newsCount, 
            bookingsTotal: bookingCount, 
            usersTotal: userCount, 
            activitiesTotal: activityCount, 
            pageViewsTotal: pageViewsStat ? pageViewsStat.count : 0, 
            documentsTotal: documentsCount,
            servicesTotal: servicesCount,
            bookingChartData: bookingChartData, 
            newsChartData: newsChartData
        });
    } catch (error) {
        console.error('Server Error /api/dashboard-stats:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์' });
    }
};

// (ไม่ต้องมี module.exports อีกต่อไป)