import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; 

export const login = async (req, res) => {
  try {
    const { username } = req.body; // รับแค่ username มาก่อน

    // 1. ค้นหา User
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบนะอ๋อจร้" });
    }

    // 🟢 2. [ชั่วคราว] ข้ามการเช็ครหัสผ่าน (Bypass)
    // ฉ้านนนปิดส่วน bcrypt.compare ไว้ให้ก่อนนะอ๋อจร้ เพื่อให้ล็อกอินได้เลยอิอิ
    
    const roleName = user.isAdmin ? "Admin" : "User";

    // 3. สร้าง Token
    const token = jwt.sign(
      { id: user._id, role: roleName },
      process.env.JWT_SECRET || "sut_park_secret_key",
      { expiresIn: "1d" }
    );

    // 4. ส่งข้อมูลกลับ
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: roleName,
        isAdmin: user.isAdmin
      },
    });

  } catch (error) {
    console.error("Bypass Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";

// export const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // 1. ค้นหา User ในฐานข้อมูล
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" });
//     }

//     // 2. เช็ครหัสผ่าน
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
//     }

//     // 3. แปลง isAdmin เป็น Role (Admin/User)
//     const roleName = user.isAdmin ? "Admin" : "User";

//     // 4. สร้าง Token
//     const token = jwt.sign(
//       { id: user._id, role: roleName },
//       process.env.JWT_SECRET || "sut_park_secret_key", // ใส่ Default กันเหนียวไว้
//       { expiresIn: "1d" }
//     );

//     // 5. ส่งข้อมูลกลับไปหน้าบ้าน
//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         role: roleName,     // ✅ ส่ง Role ที่แปลงแล้วกลับไป
//         isAdmin: user.isAdmin
//       },
//     });

//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };