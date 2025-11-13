// server.js (ฉบับ Refactor)

// --- 1. Imports ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 

const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');

// ⭐️ (นำเข้า Controllers - เพิ่ม serviceItemController)
const newsController = require('./controllers/newsController');
const activityController = require('./controllers/activityController');
const bookingController = require('./controllers/bookingController');
const contactController = require('./controllers/contactController');
const mainController = require('./controllers/mainController');
const serviceItemController = require('./controllers/serviceItemController'); // ⭐️ (เพิ่ม)

// ⭐️ (นำเข้า Admin Routes)
const newsRoutes = require('./routes/newsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const serviceItemRoutes = require('./routes/serviceItemRoutes');

// --- 2. Config ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ksuthikiat_db_user:5ux2ke37SFIjaXW5@sutpark.h7aiwyt.mongodb.net/sut_park_db?appName=sutpark";
const JWT_SECRET = process.env.JWT_SECRET || 'SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!'; 
const app = express();
const port = process.env.PORT || 3000; 

// --- 3. Middlewares ---

// ⭐️⭐️ (สำคัญ) 1. อัปเดต CORS ⭐️⭐️
const corsOptions = {
    origin: [
        'http://localhost:5173', // (Admin Panel)
        'https://sut-park-a.vercel.app', // (Admin Panel - Production)
        null, // (สำหรับเทส HTML local)
        'https://your-public-website.com' // ⬅️⭐️⭐️ (สำคัญมาก!) ใส่ URL ของ "เว็บสาธารณะ" ของคุณที่นี่
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS', 
    allowedHeaders: 'Content-Type,Authorization' 
};
app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// --- 4. API Routes (Public) ---
app.get('/api/test', mainController.getApiTest);
app.post('/api/login', mainController.loginUser);
app.post('/submit-form', contactController.createPublicContact); 

app.get('/public/news', newsController.getPublicNews);
app.get('/public/activities', activityController.getPublicActivities);
app.get('/public/bookings', bookingController.getPublicBookings);

// ⭐️⭐️ (สำคัญ) 2. เพิ่ม Route ใหม่สำหรับ Public ⭐️⭐️
app.get('/public/services', serviceItemController.getPublicServiceItems);


// --- 5. API Routes (Admin - Protected) ---
app.use('/api/dashboard', authenticateToken, isAdmin, dashboardRoutes);
app.use('/api/news', authenticateToken, isAdmin, newsRoutes);
app.use('/api/activities', authenticateToken, isAdmin, activityRoutes);
app.use('/api/bookings', authenticateToken, isAdmin, bookingRoutes);
app.use('/api/contacts', authenticateToken, isAdmin, contactRoutes);
app.use('/api/documents', authenticateToken, isAdmin, documentRoutes);
app.use('/api/users', authenticateToken, isAdmin, userRoutes);
app.use('/api/services', authenticateToken, isAdmin, serviceItemRoutes); // (Admin Route ยังอยู่)


// --- 6. Database Connection and Server Start ---
console.log("กำลังพยายามเชื่อมต่อ MongoDB Atlas...");
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!");
        app.listen(port, () => {
            console.log(`✅ เซิร์ฟเวอร์ API พร้อมทำงานที่ http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("❌ เกิดข้อผิดพลาดร้ายแรงในการเชื่อมต่อ MongoDB:", error.message);
        console.log("เซิร์ฟเวอร์ไม่ได้เริ่มทำงาน กรุณาตรวจสอบ MONGO_URI, IP Whitelist, และการเชื่อมต่ออินเทอร์เน็ต");
    });