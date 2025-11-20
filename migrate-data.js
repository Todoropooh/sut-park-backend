// migrate-data.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 1. โหลด Environment Variables
dotenv.config(); 

// 2. Import Models (ปรับ Path ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ)
import News from './models/newsModel.js'; 
import Activity from './models/activityModel.js'; 

const MONGO_URI = process.env.MONGO_URI;

async function runMigration() {
    if (!MONGO_URI) {
        console.error("❌ ERROR: MONGO_URI is not set in the .env file.");
        return;
    }

    console.log("Starting data migration...");
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB successfully.");

        // ⭐️ Filter: หาเอกสารที่ 'isDeleted' ยังไม่มีอยู่เลย
        const filter = { isDeleted: { $exists: false } };
        // ⭐️ Update: ตั้งค่า 'isDeleted' เป็น false และ 'deletedAt' เป็น null
        const update = { $set: { isDeleted: false, deletedAt: null } };
        
        // --- อัปเดต News Collection ---
        const newsResult = await News.updateMany(filter, update);
        console.log(`✅ News: Updated ${newsResult.modifiedCount} old documents.`);

        // --- อัปเดต Activity Collection ---
        const activityResult = await Activity.updateMany(filter, update);
        console.log(`✅ Activity: Updated ${activityResult.modifiedCount} old documents.`);

        console.log("Migration complete. Old data should now be visible.");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

runMigration();