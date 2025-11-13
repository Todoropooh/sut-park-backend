// config/cloudinary.js
import dotenv from "dotenv";
dotenv.config(); // ✅ โหลดค่าก่อน import cloudinary

import { v2 as cloudinary } from "cloudinary";

console.log("Cloudinary ENV =>", process.env.CLOUD_NAME); // ทดสอบ

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;
