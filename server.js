// 1. เรียกใช้เครื่องมือ
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // (สำหรับอัปโหลดไฟล์)
const path = require('path'); // (สำหรับจัดการเส้นทางไฟล์)

// 2. (สำคัญ!) ลิงก์เชื่อมต่อ MongoDB Atlas ของคุณ
const MONGO_URI = "mongodb+srv://ksuthikiat_db_user:5ux2ke37SFIjaXW5@sutpark.h7aiwyt.mongodb.net/sut_park_db?appName=sutpark";

// ⚠️ [คำเตือน] (สำคัญ!) นี่คือ Secret Key สำหรับสร้าง Token
const JWT_SECRET = 'SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!'; 

// 3. สร้างแอปเซิร์ฟเวอร์
const app = express();
const port = 3000;

// 4. ตั้งค่าเซิร์ฟเวอร์
app.use(cors());
app.use(express.json()); 

// ⭐️ [เพิ่มใหม่] ⭐️ ตั้งค่า Multer (ตัวอัปโหลดไฟล์)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // (ต้องสร้างโฟลเดอร์ 'uploads' ไว้)
    },
    filename: function (req, file, cb) {
        // (ตั้งชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน)
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// ⭐️ [เพิ่มใหม่] ⭐️ เปิดให้เข้าถึงโฟลเดอร์ uploads ได้
// (เพื่อให้รูปภาพแสดงในเว็บได้)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ----------------------------------------------------


// --- 5. สร้าง "พิมพ์เขียว" (Schema) ทั้งหมด ---
const contactSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true }, message: { type: String }, submittedAt: { type: Date, default: Date.now } });
const Contact = mongoose.model('Contact', contactSchema);

const bookingSchema = new mongoose.Schema({
    room: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    attendees: { type: Number, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String }, // (อัปเดตแล้ว)
    breakAgreement: { type: Boolean, default: false }, // (อัปเดตแล้ว)
    submittedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false } 
});
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { this.password = await bcrypt.hash(this.password, 10); }
    next();
});
const User = mongoose.model('User', userSchema);

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, 
    content: { type: String, required: true },
    imageUrl: { type: String }, // (เก็บเป็น Path /uploads/filename.jpg)
    publishedAt: { type: Date, default: Date.now }
});
const News = mongoose.model('News', newsSchema);

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String } 
});
const Activity = mongoose.model('Activity', activitySchema);
// ------------------------------------

// --- 6. Middleware สำหรับตรวจสอบ JWT Token ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // รูปแบบ "Bearer TOKEN"
    
    if (token == null) {
        return res.status(401).json({ message: 'ไม่พบ Token (ต้องล็อกอินก่อน)' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        }
        req.user = user; 
        next(); 
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ผู้ดูแลระบบ' });
    }
    next();
};
// ----------------------------------------------------

// --- 7. API Endpoints (POST - สาธารณะ) ---
app.post('/submit-form', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมล' });
        }
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ status: 'success', message: 'ได้รับข้อมูลติดต่อของคุณแล้ว' });
    } catch (error) {
        console.error('Error /submit-form:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

app.post('/submit-booking', async (req, res) => {
    try {
        const { room, bookingDate, bookingTime, attendees, contactName, contactEmail, contactPhone, breakAgreement } = req.body;
        if (!room || !bookingDate || !bookingTime || !contactName || !contactEmail) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลการจองให้ครบถ้วน' });
        }
        
        const newBooking = new Booking({
            ...req.body,
            contactPhone: contactPhone || null,
            breakAgreement: breakAgreement || false
        });
        await newBooking.save();
        res.status(201).json({ status: 'success', message: 'ระบบได้รับการจองของคุณแล้ว' });
    } catch (error) {
        console.error('Error /submit-booking:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});
// ----------------------------------------------------

// --- 8. API Endpoints (POST - ระบบ Admin) ---

// Endpoint สำหรับ Admin Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        const payload = {
            userId: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };
        
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); 

        res.json({
            status: 'success',
            message: 'ล็อกอินสำเร็จ',
            token: token,
            user: {
                username: user.username,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('Error /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

// สร้างผู้ใช้ใหม่ (Admin only)
app.post('/api/users/create', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
        }

        const newUser = new User({
            username,
            password, 
            isAdmin: isAdmin || false
        });
        await newUser.save();
        res.status(201).json({ status: 'success', message: `สร้างผู้ใช้ ${username} สำเร็จ` });

    } catch (error) {
        console.error('Error /api/users/create:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

// เพิ่มข่าว (Admin only)
app.post('/api/add-news', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    const { title, category, content } = req.body;
    const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !content) { 
        return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); 
    }
    
    try {
        const newNewsItem = new News({ 
            title, 
            category: category || 'ทั่วไป', 
            content, 
            imageUrl: imageUrlPath, 
            publishedAt: new Date() 
        });
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error /api/add-news:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

// ⭐️ [แก้ไข] ⭐️ เปลี่ยนให้รับไฟล์ภาพ (multipart/form-data)
app.post('/api/activities', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    try {
        const { title, date, content } = req.body;
        const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !date || !content) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน (หัวข้อ, วันที่, เนื้อหา)' });
        }
        const newActivity = new Activity({
            title,
            date: new Date(date), // (แปลงวันที่)
            content,
            imageUrl: imageUrlPath
        });
        await newActivity.save();
        res.status(201).json({ status: 'success', message: 'เพิ่มกิจกรรมใหม่สำเร็จ' });
    } catch (error) {
        console.error('Error /api/activities POST:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

// Endpoint สำหรับ Admin สร้างการจอง
// (วางใน server.js ส่วนที่ 9. API Endpoints (GET - สาธารณะ))

// ⭐️ [เพิ่มใหม่] ⭐️ Endpoint สำหรับปฏิทินหน้าบ้าน
app.get('/public/bookings', async (req, res) => {
    try {
        // 1. ดึงข้อมูลเฉพาะที่จำเป็น (ไม่เอาชื่อ, อีเมล, เบอร์โทร)
        const bookings = await Booking.find({})
                                      .select('room bookingDate bookingTime'); 
                                      
        // 2. แปลงข้อมูลให้เป็นรูปแบบที่ FullCalendar อ่านได้
        const events = bookings.map(b => {
            
            // 3. หาวันที่ (เช่น "2025-11-30")
            const dateStr = b.bookingDate.toISOString().split('T')[0];
            
            // 4. หาเวลา (เช่น "08:00" และ "12:00")
            const timeParts = b.bookingTime.split(' - ');
            const startTime = timeParts[0];
            const endTime = timeParts[1];

            // 5. สร้าง ISO DateTime (เช่น "2025-11-30T08:00:00")
            const startISO = `${dateStr}T${startTime}:00`;
            const endISO = `${dateStr}T${endTime}:00`;

            return {
                title: `จองแล้ว (${b.room})`,
                start: startISO,
                end: endISO,
                color: '#dc3545', // (สีแดงสำหรับไฮไลท์)
                display: 'block'
            };
        });

        res.json(events); // (ส่งข้อมูลที่แปลงแล้วกลับไป)

    } catch (error) {
        console.error('Error /public/bookings:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลปฏิทิน' });
    }
});
// ----------------------------------------------------

// --- 10. API Endpoints (GET - ป้องกัน Admin) ---

// (ใน server.js)
// [สำคัญ] API สำหรับ Dashboard Stats (รองรับ Filter)
app.get('/api/dashboard-stats', authenticateToken, isAdmin, async (req, res) => {
    console.log("กำลังดึงข้อมูล /api/dashboard-stats (ยืนยันสิทธิ์แล้ว)"); 
    
    const filter = req.query.filter || 'month';
    let groupingId;
    let sortCriteria;
    let labelFormat;

    switch (filter) {
        case 'day':
            groupingId = { day: { $dayOfMonth: "$bookingDate" }, month: { $month: "$bookingDate" }, year: { $year: "$bookingDate" } };
            sortCriteria = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
            labelFormat = { $dateToString: { format: "%d/%m/%Y", date: { $dateFromParts: { 'year': "$_id.year", 'month': "$_id.month", 'day': "$_id.day" } }, timezone: "+07:00" } };
            break;
        case 'year':
            groupingId = { year: { $year: "$bookingDate" } };
            sortCriteria = { "_id.year": 1 };
            labelFormat = { $toString: "$_id.year" }; 
            break;
        case 'month':
        default:
            groupingId = { month: { $month: "$bookingDate" }, year: { $year: "$bookingDate" } };
            sortCriteria = { "_id.year": 1, "_id.month": 1 };
            labelFormat = { $concat: [ { $toString: "$_id.month" }, "/", { $toString: "$_id.year" } ] };
            break;
    }

    try {
        // ⭐️ [นี่คือส่วนที่แก้ไข] ⭐️
        const newsCount = await News.countDocuments();
        const bookingCount = await Booking.countDocuments();
        const userCount = await User.countDocuments();
        const activityCount = await Activity.countDocuments(); // (เพิ่มการนับกิจกรรม)

        const bookingAgg = await Booking.aggregate([
            { $group: { _id: groupingId, count: { $sum: 1 } } },
            { $sort: sortCriteria }, 
            { $project: { _id: 0, label: labelFormat, count: 1 } }
        ]);
        
        const bookingChartData = {
            labels: bookingAgg.map(item => item.label),
            data: bookingAgg.map(item => item.count)
        };
        
        const newsAgg = await News.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        const newsChartData = {
            labels: newsAgg.map(item => item._id || 'ทั่วไป'),
            data: newsAgg.map(item => item.count)
        };

        // ⭐️ [นี่คือส่วนที่แก้ไข] ⭐️
        res.json({
            newsTotal: newsCount,
            bookingsTotal: bookingCount,
            usersTotal: userCount,
            activitiesTotal: activityCount, // (เพิ่มการส่งค่านี้กลับไป)
            bookingChartData: bookingChartData,
            newsChartData: newsChartData
        });

    } catch (error) {
        console.error('Server Error /api/dashboard-stats:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์' });
    }
});

// ดึงข้อมูลการจอง (Admin only)
app.get('/api/bookings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ submittedAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ดึงข้อมูลติดต่อ (Admin only)
app.get('/api/contacts', authenticateToken, isAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ submittedAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ดึงข้อมูลผู้ใช้ (Admin only)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ดึงข้อมูลข่าว (Admin only)
app.get('/api/news', authenticateToken, isAdmin, async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ดึงข่าวชิ้นเดียว (Admin only)
app.get('/api/news/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' });
        }
        const newsItem = await News.findById(id);
        if (!newsItem) {
            return res.status(404).json({ message: 'ไม่พบข่าวนี้' });
        }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ดึงข้อมูลกิจกรรม (Admin only)
app.get('/api/activities', authenticateToken, isAdmin, async (req, res) => {
    try {
        const activities = await Activity.find({}).sort({ date: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ⭐️ [เพิ่มใหม่] ⭐️ ดึงกิจกรรมชิ้นเดียว (Admin only)
app.get('/api/activities/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' });
        }
        const activityItem = await Activity.findById(id);
        if (!activityItem) {
            return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });
        }
        res.json(activityItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
// ----------------------------------------------------

// --- 11. API Endpoints (PUT - ป้องกัน Admin) ---
app.put('/api/news/:id', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหา' });
        }

        const updateData = {
            title,
            category: category || 'ทั่วไป',
            content
        };

        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const updatedNews = await News.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } 
        );

        if (!updatedNews) {
            return res.status(404).json({ message: 'ไม่พบข่าวนี้' });
        }
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        console.error('Error /api/news/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// ⭐️ [เพิ่มใหม่] ⭐️ Endpoint สำหรับ "แก้ไข" กิจกรรม
app.put('/api/activities/:id', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, content } = req.body;

        if (!title || !date || !content) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน' });
        }

        const updateData = {
            title,
            date: new Date(date), // (แปลงวันที่)
            content
        };

        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const updatedActivity = await Activity.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } 
        );

        if (!updatedActivity) {
            return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });
        }
        res.json({ status: 'success', message: 'อัปเดตกิจกรรมสำเร็จ', data: updatedActivity });
    } catch (error) {
        console.error('Error /api/activities/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
// ----------------------------------------------------

// --- 12. API Endpoints (DELETE - ป้องกัน Admin) ---
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
        }
        res.json({ status: 'success', message: `ลบผู้ใช้ ${deletedUser.username} สำเร็จ` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

app.delete('/api/news/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' });
        }
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) {
            return res.status(404).json({ message: 'ไม่พบข่าวนี้' });
        }
        res.json({ status: 'success', message: 'ลบข่าวสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

app.delete('/api/activities/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' });
        }
        const deletedActivity = await Activity.findByIdAndDelete(id);
        if (!deletedActivity) {
            return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' });
        }
        res.json({ status: 'success', message: 'ลบกิจกรรมสำเร็จ' });
    } catch (error) {
        console.error('Error /api/activities/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

app.delete('/api/bookings/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID การจองไม่ถูกต้อง' });
        }
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'ไม่พบรายการจองนี้' });
        }
        res.json({ status: 'success', message: 'ลบรายการจองสำเร็จ' });
    } catch (error) {
        console.error('Error /api/bookings/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});
// ----------------------------------------------------


// 13. (สำคัญ) สั่งให้เชื่อมต่อฐานข้อมูล "ก่อน" แล้วค่อยเปิดเซิร์ฟเวอร์
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