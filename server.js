// 1. เรียกใช้เครื่องมือ
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs'); // ⭐️ [ใหม่] ⭐️ เพิ่ม fs สำหรับจัดการไฟล์

// 2. ⭐️ [แก้ไข] ⭐️ ดึง "ความลับ" จาก Environment Variables
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ksuthikiat_db_user:5ux2ke37SFIjaXW5@sutpark.h7aiwyt.mongodb.net/sut_park_db?appName=sutpark";
const JWT_SECRET = process.env.JWT_SECRET || 'SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!'; 

// 3. ⭐️ [แก้ไข] ⭐️ ตั้งค่าพอร์ต (Port)
const app = express();
const port = process.env.PORT || 3000; 

// 4. ตั้งค่าเซิร์ฟเวอร์
app.use(cors());
app.use(express.json()); 

// --- การตั้งค่า Multer (สำหรับรูปภาพ News/Activities) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ----------------------------------------------------

// ⭐️ [ใหม่] ⭐️ --- การตั้งค่า Multer (สำหรับไฟล์เอกสาร) ---
// 4.1. ระบุและสร้างโฟลเดอร์สำหรับเก็บไฟล์เอกสาร
const documentUploadDir = path.join(__dirname, 'uploads/documents');
if (!fs.existsSync(documentUploadDir)){
    fs.mkdirSync(documentUploadDir, { recursive: true });
}

// 4.2. ตั้งค่า Storage Engine สำหรับเอกสาร (ใช้ชื่อแบบป้องกันการซ้ำ)
const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, documentUploadDir); // เก็บที่ 'uploads/documents/'
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่ (เวลา + สุ่ม + ชื่อเดิม) กันชื่อซ้ำ
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // แก้ปัญหาชื่อไฟล์ภาษาไทย
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, uniqueSuffix + '-' + originalName);
    }
});

// 4.3. สร้าง instance ของ multer สำหรับเอกสาร
const documentUpload = multer({ storage: documentStorage });
// (เราใช้ app.use('/uploads', ...) ตัวเดิมได้เลย เพราะมันครอบคลุม /uploads/documents อยู่แล้ว)
// ----------------------------------------------------


// --- 5. สร้าง "พิมพ์เขียว" (Schema) ทั้งหมด ---
// ⭐️ [แก้ไข] ⭐️ เพิ่ม isRead ใน Contact Schema
const contactSchema = new mongoose.Schema({ 
    name: { type: String, required: true }, 
    email: { type: String, required: true }, 
    message: { type: String }, 
    submittedAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false } // ⭐️ เพิ่มบรรทัดนี้
});
const Contact = mongoose.model('Contact', contactSchema);

// (Booking Schema)
const bookingSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, enum: ['morning', 'afternoon'], required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    roomLayout: { type: String },
    equipment: { type: String },
    break: { type: Boolean, default: false },
    details: { type: String },
    room: { type: String, default: 'ห้องประชุม' },
    submittedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// (User Schema)
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

// (News Schema)
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, 
    content: { type: String, required: true },
    imageUrl: { type: String }, 
    publishedAt: { type: Date, default: Date.now }
});
const News = mongoose.model('News', newsSchema);

// (Activity Schema)
const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String } 
});
const Activity = mongoose.model('Activity', activitySchema);

// ⭐️ [ใหม่] ⭐️ (Document Schema)
const documentSchema = new mongoose.Schema({
    originalFilename: { 
        type: String, 
        required: true 
    },
    storedFilename: { // ชื่อไฟล์ที่เก็บจริงบนเซิร์ฟเวอร์
        type: String, 
        required: true, 
        unique: true 
    },
    path: { // URL path ที่จะใช้ดาวน์โหลด
        type: String, 
        required: true 
    },
    description: { // คำอธิบายไฟล์
        type: String, 
        required: false 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
});
const Document = mongoose.model('Document', documentSchema);
// ------------------------------------

// --- 6. Middleware สำหรับตรวจสอบ JWT Token ---
const authenticateToken = (req, res, next) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
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
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ผู้ดูแลระบบ' });
    }
    next();
};
// ----------------------------------------------------

// --- 7. API Endpoints (POST - สาธารณะ) ---
app.post('/submit-form', async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    try {
        const { name, email, message } = req.body;
        if (!name || !email) { return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมล' }); }
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ status: 'success', message: 'ได้รับข้อมูลติดต่อของคุณแล้ว' });
    } catch (error) {
        console.error('Error /submit-form:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

/* [ปิดการใช้งาน] app.post('/submit-booking', ...) */
// ----------------------------------------------------

// --- 8. API Endpoints (POST - ระบบ Admin) ---
app.post('/api/login', async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    try {
        const { username, password } = req.body;
        if (!username || !password) { return res.status(400).json({ message: 'กรุณากรอก Username และ Password' }); }
        const user = await User.findOne({ username: username });
        if (!user) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' }); }
        const payload = { userId: user._id, username: user.username, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); 
        res.json({ status: 'success', message: 'ล็อกอินสำเร็จ', token: token, user: { username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error('Error /api/login:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

app.post('/api/users/create', authenticateToken, isAdmin, async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    try {
        const { username, password, isAdmin } = req.body;
        if (!username || !password) { return res.status(400).json({ message: 'กรุณากรอก Username และ Password' }); }
        const existingUser = await User.findOne({ username });
        if (existingUser) { return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' }); }
        const newUser = new User({ username, password, isAdmin: isAdmin || false });
        await newUser.save();
        res.status(201).json({ status: 'success', message: `สร้างผู้ใช้ ${username} สำเร็จ` });
    } catch (error) {
        console.error('Error /api/users/create:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

app.post('/api/add-news', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    const { title, category, content } = req.body;
    const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อ และเนื้อหาข่าว' }); }
    try {
        const newNewsItem = new News({ title, category: category || 'ทั่วไป', content, imageUrl: imageUrlPath, publishedAt: new Date() });
        await newNewsItem.save();
        res.status(201).json({ status: 'success', message: `สร้างข่าว "${title}" สำเร็จ` });
    } catch (error) {
        console.error('Error /api/add-news:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

app.post('/api/activities', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    try {
        const { title, date, content } = req.body;
        const imageUrlPath = req.file ? `/uploads/${req.file.filename}` : null;
        if (!title || !date || !content) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน' }); }
        const newActivity = new Activity({ title, date: new Date(date), content, imageUrl: imageUrlPath });
        await newActivity.save();
        res.status(201).json({ status: 'success', message: 'เพิ่มกิจกรรมใหม่สำเร็จ' });
    } catch (error) {
        console.error('Error /api/activities POST:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});

app.post('/api/bookings', authenticateToken, isAdmin, async (req, res) => {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิม)
    try {
        const { eventName, bookingDate, timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest, details } = req.body;
        if (!eventName || !bookingDate || !timeSlot || !contactName || !email) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลการจองให้ครบถ้วน' }); }
        const newBooking = new Booking({ room: 'ห้องประชุม', eventName, bookingDate: new Date(bookingDate), timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest || false, details });
        await newBooking.save();
        res.status(201).json({ status: 'success', message: `สร้างการจอง "${eventName}" สำเร็จ`, data: newBooking });
    } catch (error) {
        console.error('Error /api/bookings POST:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์ในการสร้างการจองใหม่' });
    }
});
// ----------------------------------------------------


// --- 9. API Endpoints (GET - สาธารณะ) ---
// ... (โค้ดส่วนนี้ของคุณเหมือนเดิม /public/news, /public/activities, /public/bookings)
app.get('/public/news', async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/public/activities', async (req, res) => {
    try {
        const activities = await Activity.find({}).sort({ date: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/public/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({}).select('room bookingDate timeSlot eventName'); 
        const events = bookings.map(b => {
            const dateStr = b.bookingDate.toISOString().split('T')[0];
            let startTime, endTime;
            if (b.timeSlot === 'morning') { startTime = '08:30'; endTime = '12:30'; } 
            else if (b.timeSlot === 'afternoon') { startTime = '13:00'; endTime = '17:00'; } 
            else { return { title: `${b.eventName || b.room} (ไม่ระบุเวลา)`, start: dateStr, color: '#dc3545' }; }
            const startISO = `${dateStr}T${startTime}:00`;
            const endISO = `${dateStr}T${endTime}:00`;
            return { title: `${b.eventName || b.room} (${b.timeSlot === 'morning' ? 'เช้า' : 'บ่าย'})`, start: startISO, end: endISO, color: '#dc3545', display: 'block' };
        });
        res.json(events); 
    } catch (error) {
        console.error('Error /public/bookings:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลปฏิทิน' });
    }
});
// ----------------------------------------------------


// --- 10. API Endpoints (GET - ป้องกัน Admin) ---
// ... (โค้ดส่วนนี้ของคุณเหมือนเดิม /api/dashboard-stats, /api/bookings, ... /api/activities/:id)
app.get('/api/dashboard-stats', authenticateToken, isAdmin, async (req, res) => {
    console.log("กำลังดึงข้อมูล /api/dashboard-stats (ยืนยันสิทธิ์แล้ว)"); 
    const filter = req.query.filter || 'month';
    let groupingId, sortCriteria, labelFormat;

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
        const [newsCount, bookingCount, userCount, activityCount] = await Promise.all([
            News.countDocuments(), Booking.countDocuments(), User.countDocuments(), Activity.countDocuments()
        ]);
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
            newsTotal: newsCount, bookingsTotal: bookingCount, usersTotal: userCount, activitiesTotal: activityCount, 
            bookingChartData: bookingChartData, newsChartData: newsChartData
        });
    } catch (error) {
        console.error('Server Error /api/dashboard-stats:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์' });
    }
});
app.get('/api/bookings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ bookingDate: -1 }); 
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/contacts', authenticateToken, isAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ submittedAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/contacts/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
        const contactItem = await Contact.findById(id);
        if (!contactItem) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
        res.json(contactItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/news', authenticateToken, isAdmin, async (req, res) => {
    try {
        const news = await News.find({}).sort({ publishedAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/news/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        const newsItem = await News.findById(id);
        if (!newsItem) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/activities', authenticateToken, isAdmin, async (req, res) => {
    try {
        const activities = await Activity.find({}).sort({ date: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.get('/api/activities/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' }); }
        const activityItem = await Activity.findById(id);
        if (!activityItem) { return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' }); }
        res.json(activityItem);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
// ----------------------------------------------------

// --- 11. API Endpoints (PUT/PATCH - ป้องกัน Admin) ---
// ... (โค้ดส่วนนี้ของคุณเหมือนเดิม /api/news/:id, ... /api/contacts/:id/read)
app.put('/api/news/:id', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;
        if (!title || !content) { return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหา' }); }
        const updateData = { title, category: category || 'ทั่วไป', content };
        if (req.file) { updateData.imageUrl = `/uploads/${req.file.filename}`; }
        const updatedNews = await News.findByIdAndUpdate( id, updateData, { new: true } );
        if (!updatedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json({ status: 'success', message: 'อัปเดตข่าวสำเร็จ', data: updatedNews });
    } catch (error) {
        console.error('Error /api/news/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.put('/api/activities/:id', authenticateToken, isAdmin, upload.single('imageUrl'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, content } = req.body;
        let { imageUrl: existingImageUrlFromForm } = req.body; 
        if (!title || !date || !content) { return res.status(400).json({ message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน' }); }
        const updateData = { title, date: new Date(date), content };
        if (req.file) { updateData.imageUrl = `/uploads/${req.file.filename}`; } 
        else if (existingImageUrlFromForm === '') { updateData.imageUrl = ''; } 
        else if (existingImageUrlFromForm) { updateData.imageUrl = existingImageUrlFromForm; }
        const updatedActivity = await Activity.findByIdAndUpdate( id, updateData, { new: true } );
        if (!updatedActivity) { return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' }); }
        res.json({ status: 'success', message: 'อัปเดตกิจกรรมสำเร็จ', data: updatedActivity });
    } catch (error) {
        console.error('Error /api/activities/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.put('/api/bookings/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID การจองไม่ถูกต้อง' }); }
        const { eventName, bookingDate, timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest, details } = req.body;
        if (!eventName || !bookingDate || !timeSlot || !contactName || !email) { return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' }); }
        const updateData = { eventName, bookingDate: new Date(bookingDate), timeSlot, contactName, email, phone, roomLayout, equipment, break: breakRequest || false, details };
        const updatedBooking = await Booking.findByIdAndUpdate( id, updateData, { new: true } );
        if (!updatedBooking) { return res.status(404).json({ message: 'ไม่พบการจองนี้' }); }
        res.json({ status: 'success', message: 'อัปเดตการจองสำเร็จ', data: updatedBooking });
    } catch (error) {
        console.error('Error /api/bookings/:id PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตการจอง' });
    }
});
app.put('/api/users/:id/update-role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;
        if (typeof isAdmin !== 'boolean') { return res.status(400).json({ message: 'รูปแบบข้อมูลสิทธิ์ไม่ถูกต้อง' }); }
        const updatedUser = await User.findByIdAndUpdate( id, { isAdmin }, { new: true } ).select('-password');
        if (!updatedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: `อัปเดตสิทธิ์ผู้ใช้ ${updatedUser.username} เป็น ${isAdmin ? 'Admin' : 'User'} สำเร็จ`, user: updatedUser });
    } catch (error) {
        console.error('Error /api/users/:id/update-role PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์' });
    }
});
app.put('/api/users/:id/change-password', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) { return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านใหม่ที่มีอย่างน้อย 6 ตัวอักษร' }); }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate( id, { password: hashedPassword }, { new: true } ).select('-password');
        if (!updatedUser) { return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
        console.error('Error /api/users/:id/change-password PUT:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    }
});
app.patch('/api/contacts/:id/read', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body; // { isRead: true }
        if (typeof isRead !== 'boolean') {
            return res.status(400).json({ message: 'Invalid isRead value' });
        }
        const contact = await Contact.findByIdAndUpdate(
            id, 
            { isRead }, // Update object
            { new: true } // Return the new document
        );
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(contact); // Send back the updated contact
    } catch (error) {
        console.error('Error /api/contacts/:id/read PATCH:', error);
        res.status(500).json({ message: error.message });
    }
});
// ----------------------------------------------------

// --- 12. API Endpoints (DELETE - ป้องกัน Admin) ---
// ... (โค้ดส่วนนี้ของคุณเหมือนเดิม /api/users/:id, ... /api/contacts/:id)
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) { return res.status(4404).json({ message: 'ไม่พบผู้ใช้นี้' }); }
        res.json({ status: 'success', message: `ลบผู้ใช้ ${deletedUser.username} สำเร็จ` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.delete('/api/news/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข่าวไม่ถูกต้อง' }); }
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) { return res.status(404).json({ message: 'ไม่พบข่าวนี้' }); }
        res.json({ status: 'success', message: 'ลบข่าวสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.delete('/api/activities/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID กิจกรรมไม่ถูกต้อง' }); }
        const deletedActivity = await Activity.findByIdAndDelete(id);
        if (!deletedActivity) { return res.status(404).json({ message: 'ไม่พบกิจกรรมนี้' }); }
        res.json({ status: 'success', message: 'ลบกิจกรรมสำเร็จ' });
    } catch (error) {
        console.error('Error /api/activities/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
app.delete('/api/bookings/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID การจองไม่ถูกต้อง' }); }
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) { return res.status(404).json({ message: 'ไม่พบรายการจองนี้' }); }
        res.json({ status: 'success', message: 'ลบรายการจองสำเร็จ' });
    } catch (error) {
        console.error('Error /api/bookings/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});
app.delete('/api/contacts/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID ข้อมูลติดต่อไม่ถูกต้อง' }); }
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) { return res.status(404).json({ message: 'ไม่พบข้อมูลติดต่อนี้' }); }
        res.json({ status: 'success', message: 'ลบข้อมูลติดต่อสำเร็จ' });
    } catch (error) {
        console.error('Error /api/contacts/:id DELETE:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
});


// ⭐️ [ใหม่] ⭐️ --- 12.5. API Endpoints (ระบบจัดการเอกสาร) ---

// POST: อัปโหลดเอกสาร
app.post('/api/documents/upload', authenticateToken, isAdmin, documentUpload.single('documentFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
        }
        
        // 'documentFile' คือ 'name' ของ <input type="file"> ในหน้า HTML
        const { description } = req.body;
        const { originalname, filename } = req.file;

        // สร้าง URL path ที่ถูกต้อง (จะถูก serve โดย /uploads)
        const fileUrlPath = `/uploads/documents/${filename}`;
        
        const newDocument = new Document({
            originalFilename: Buffer.from(originalname, 'latin1').toString('utf8'), // เก็บชื่อภาษาไทย
            storedFilename: filename,
            path: fileUrlPath, // เก็บเป็น URL path
            description: description || 'ไม่มีคำอธิบาย'
        });

        await newDocument.save();
        res.status(201).json({ 
            status: 'success',
            message: 'อัปโหลดไฟล์และบันทึกข้อมูลสำเร็จ!', 
            document: newDocument 
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปโหลดเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: ดึงข้อมูลเอกสารทั้งหมด
app.get('/api/documents', authenticateToken, isAdmin, async (req, res) => {
    try {
        // ค้นหาและเรียงลำดับ ให้ไฟล์ใหม่สุดขึ้นก่อน
        const documents = await Document.find().sort({ uploadedAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE: ลบเอกสาร
app.delete('/api/documents/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'ID เอกสารไม่ถูกต้อง' }); }

        // 1. ค้นหาข้อมูลเอกสารใน DB ก่อน
        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'ไม่พบเอกสารนี้' });
        }

        // 2. สร้าง path ที่อยู่ของไฟล์จริง
        // (เราใช้ documentUploadDir ที่ประกาศไว้ด้านบน)
        const filePath = path.join(documentUploadDir, document.storedFilename);

        // 3. สั่งลบไฟล์จริงออกจากเซิร์ฟเวอร์ (Filesystem)
        fs.unlink(filePath, async (err) => {
            if (err) {
                // ถ้าหาไฟล์ไม่เจอ ก็แค่ log เตือนไว้ แต่ยังลบใน DB ต่อ
                console.warn(`ไม่สามารถลบไฟล์ได้ (อาจถูกลบไปแล้ว): ${filePath}`, err.message);
            }

            // 4. ลบข้อมูลออกจากฐานข้อมูล (MongoDB)
            await Document.findByIdAndDelete(id);

            res.json({ status: 'success', message: 'ลบเอกสารเรียบร้อยแล้ว' });
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบเอกสาร:', error);
        res.status(500).json({ message: 'Server error' });
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