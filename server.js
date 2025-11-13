// server.js (ฉบับ Refactor - Final Fix + CORS Enhanced)

// --- 1. Imports ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 

const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');

const newsController = require('./controllers/newsController');
const activityController = require('./controllers/activityController');
const bookingController = require('./controllers/bookingController');
const contactController = require('./controllers/contactController');
const mainController = require('./controllers/mainController');
const serviceItemController = require('./controllers/serviceItemController'); 

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
// ⭐️ เพิ่ม CORS แบบกำหนดเอง (รองรับ origin null)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // อนุญาต origin ที่กำหนด
    const allowedOrigins = [
        'http://localhost:5173',
        'https://sut-park-a.vercel.app',
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
        // อนุญาต origin ที่อยู่ใน list หรือไม่มี origin (null)
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // จัดการ preflight request
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// --- 4. API Routes (Public) ---
app.get('/api/test', mainController.getApiTest);
app.post('/api/login', mainController.loginUser);
app.post('/submit-form', contactController.createPublicContact); 

app.get('/public/news', newsController.getPublicNews);
app.get('/public/activities', activityController.getPublicActivities);
app.get('/public/bookings', bookingController.getPublicBookings);
app.get('/public/services', serviceItemController.getPublicServiceItems); 


// --- 5. API Routes (Admin - Protected) ---
app.use('/api/dashboard', authenticateToken, isAdmin, dashboardRoutes);
app.use('/api/news', authenticateToken, isAdmin, newsRoutes);
app.use('/api/activities', authenticateToken, isAdmin, activityRoutes);
app.use('/api/bookings', authenticateToken, isAdmin, bookingRoutes);
app.use('/api/contacts', authenticateToken, isAdmin, contactRoutes);
app.use('/api/documents', authenticateToken, isAdmin, documentRoutes);
app.use('/api/users', authenticateToken, isAdmin, userRoutes);
app.use('/api/services', authenticateToken, isAdmin, serviceItemRoutes); 


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