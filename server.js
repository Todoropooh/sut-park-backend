// server.js (ฉบับ Refactor - Final CORS Fix)

// --- 1. Imports ---
const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
const path = require('path'); 

const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');
// (Controllers - เหมือนเดิม)
const newsController = require('./controllers/newsController');
const activityController = require('./controllers/activityController');
const bookingController = require('./controllers/bookingController');
const contactController = require('./controllers/contactController');
const mainController = require('./controllers/mainController');
const serviceItemController = require('./controllers/serviceItemController'); 
// (Routes - เหมือนเดิม)
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
const host = '0.0.0.0'; 

// --- 3. Middlewares ---
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// (Whitelist สำหรับ "Admin" - เหมือนเดิม)
const adminWhitelist = [
  'http://localhost:5173', 
  'https://sut-park-a.vercel.app'
];
const adminCorsOptions = {
  origin: function (origin, callback) {
    if (adminWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS', 
  allowedHeaders: 'Content-Type,Authorization' 
};

// ⭐️⭐️ (นี่คือจุดที่แก้ไข) ⭐️⭐️
// (Config CORS สำหรับ "Public")
const publicCorsOptions = {
  origin: '*', // (อนุญาต "ทุกคน" (Everyone) รวมถึง 'null')
  methods: 'GET,POST,OPTIONS', // ⬅️ (แก้ไข) เพิ่ม 'POST' และ 'OPTIONS'
};


// --- 4. API Routes (Public) ---
// (หุ้ม Routes สาธารณะ ด้วย 'cors(publicCorsOptions)')
app.get('/api/test', cors(publicCorsOptions), mainController.getApiTest);
app.get('/public/news', cors(publicCorsOptions), newsController.getPublicNews);
app.get('/public/activities', cors(publicCorsOptions), activityController.getPublicActivities);
app.get('/public/bookings', cors(publicCorsOptions), bookingController.getPublicBookings);
app.get('/public/services', cors(publicCorsOptions), serviceItemController.getPublicServiceItems);

// (Routes ที่ใช้ POST)
app.post('/submit-form', cors(publicCorsOptions), contactController.createPublicContact);
app.post('/api/login', cors(publicCorsOptions), mainController.loginUser); // ⬅️ (ตอนนี้จะอนุญาต POST แล้ว)


// --- 5. API Routes (Admin - Protected) ---
// (หุ้ม Routes แอดมิน ด้วย 'cors(adminCorsOptions)')
app.use('/api/dashboard', cors(adminCorsOptions), authenticateToken, isAdmin, dashboardRoutes);
app.use('/api/news', cors(adminCorsOptions), authenticateToken, isAdmin, newsRoutes);
app.use('/api/activities', cors(adminCorsOptions), authenticateToken, isAdmin, activityRoutes);
app.use('/api/bookings', cors(adminCorsOptions), authenticateToken, isAdmin, bookingRoutes);
app.use('/api/contacts', cors(adminCorsOptions), authenticateToken, isAdmin, contactRoutes);
app.use('/api/documents', cors(adminCorsOptions), authenticateToken, isAdmin, documentRoutes);
app.use('/api/users', cors(adminCorsOptions), authenticateToken, isAdmin, userRoutes);
app.use('/api/services', cors(adminCorsOptions), authenticateToken, isAdmin, serviceItemRoutes); 


// --- 6. Database Connection and Server Start ---
console.log("กำลังพยายามเชื่อมต่อ MongoDB Atlas...");
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!");
        
        app.listen(port, host, () => {
            console.log(`✅ เซิร์ฟเวอร์ API พร้อมทำงานที่ http://${host}:${port}`);
        });
    })
    .catch((error) => {
        console.error("❌ เกิดข้อผิดพลาดร้ายแรงในการเชื่อมต่อ MongoDB:", error.message);
        console.log("เซิร์ฟเวอร์ไม่ได้เริ่มทำงาน กรุณาตรวจสอบ MONGO_URI, IP Whitelist, และการเชื่อมต่ออินเทอร์เน็ต");
    });