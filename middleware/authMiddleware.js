import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUTPARK_SECRET_KEY_@2025_CHANGE_ME_NOW!";

// Middleware ตรวจสอบ Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token ไม่ถูกต้อง" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token หมดอายุ" });
    req.user = user;
    next();
  });
};

// Middleware ตรวจสอบ Admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "ต้องเป็น Admin เท่านั้น" });
};
