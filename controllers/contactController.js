import Contact from "../models/contactModel.js";

// --- 1. Public: สร้างข้อความใหม่ (จากหน้าเว็บ) ---
export const createPublicContact = async (req, res) => {
  try {
    // ⭐️ รับค่า phone เข้ามาด้วย
    const { name, email, phone, subject, message } = req.body;

    // Validation ง่ายๆ
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    
    const newContact = new Contact({ 
      name, 
      email, 
      phone: phone || '-', // ถ้าไม่มีเบอร์ ใส่ขีดไว้
      subject, 
      message,
      isRead: false // ค่าเริ่มต้นคือยังไม่อ่าน
    });

    await newContact.save();
    res.status(201).json({ message: "ส่งข้อความสำเร็จ เราจะติดต่อกลับโดยเร็วที่สุด" });

  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งข้อความ" });
  }
};

// --- 2. Admin: ดึงข้อความทั้งหมด ---
export const getAllContacts = async (req, res) => {
  try {
    // เรียงจาก ใหม่ -> เก่า (descending)
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. Admin: ลบข้อความ ---
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return res.status(404).json({ message: "ไม่พบข้อความนี้" });
    }

    res.json({ message: "ลบข้อความสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. Admin: อัปเดตสถานะ (เช่น อ่านแล้ว) ---
// (ใช้สำหรับเปลี่ยน isRead: true)
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(
      id, 
      req.body, // รับค่าที่ส่งมา (เช่น { isRead: true })
      { new: true }
    );

    if (!updatedContact) {
        return res.status(404).json({ message: "ไม่พบข้อความนี้" });
    }

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. Admin: นับจำนวนข้อความที่ยังไม่อ่าน (สำหรับ Badge) ---
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Contact.countDocuments({ isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};