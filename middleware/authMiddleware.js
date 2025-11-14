import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!";

// Middleware ตรวจสอบ Token (ถูกต้องแล้ว)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token ไม่ถูกต้อง" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token หมดอายุ" });
    req.user = user; // ⭐️ user ที่ได้จาก token คือ { userId, username, isAdmin }
    next();
  });
};

// Middleware ตรวจสอบ Admin
export const isAdmin = (req, res, next) => {
  // 1. ⭐️ (แก้ไข) ต้องเช็ค 'req.user.isAdmin' ไม่ใช่ 'req.user.role'
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    res.status(403).json({ message: "ต้องเป็น Admin เท่านั้น" });
  }
};