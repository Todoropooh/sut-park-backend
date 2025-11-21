import mongoose from 'mongoose';
import dotenv from 'dotenv';

// โหลดค่าจาก .env (บรรทัดนี้สำคัญมาก)
dotenv.config(); 

// Import Models ทั้งหมด
import News from './models/newsModel.js'; 
import Activity from './models/activityModel.js'; 
import ServiceItem from './models/serviceItemModel.js'; 

const MONGO_URI = process.env.MONGO_URI;

async function runMigration() {
    // เช็คว่าอ่านค่าจาก .env ได้ไหม
    if (!MONGO_URI) {
        console.error("❌ ERROR: ไม่พบ MONGO_URI");
        console.error("   กรุณาตรวจสอบไฟล์ .env ว่าบันทึกเรียบร้อยแล้วหรือไม่");
        return;
    }

    console.log("🚀 กำลังเริ่มกู้คืนข้อมูลเก่า...");
    
    try {
        // เชื่อมต่อ Database
        await mongoose.connect(MONGO_URI);
        console.log("✅ เชื่อมต่อ MongoDB สำเร็จ!");

        // เงื่อนไข: หาข้อมูลเก่าที่ยังไม่มีป้าย 'isDeleted'
        const filter = { isDeleted: { $exists: false } };
        
        // คำสั่ง: แปะป้ายว่า "ยังไม่ถูกลบ" (isDeleted: false)
        const update = { $set: { isDeleted: false, deletedAt: null } };
        
        // 1. กู้ข้อมูลข่าว (News)
        const newsResult = await News.updateMany(filter, update);
        console.log(`📰 News: กู้คืนแล้ว ${newsResult.modifiedCount} รายการ`);

        // 2. กู้ข้อมูลกิจกรรม (Activity)
        const activityResult = await Activity.updateMany(filter, update);
        console.log(`📅 Activity: กู้คืนแล้ว ${activityResult.modifiedCount} รายการ`);

        // 3. กู้ข้อมูลบริการ (Services)
        const serviceResult = await ServiceItem.updateMany(filter, update);
        console.log(`🚀 Services: กู้คืนแล้ว ${serviceResult.modifiedCount} รายการ`);

        console.log("\n🎉 เสร็จสิ้น! ลอง Refresh หน้าเว็บดูได้เลยครับ");

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 ตัดการเชื่อมต่อ.");
    }
}

runMigration();