import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import fs from 'fs';
import csv from 'csv-parser';

/* ===========================
   CREATE USER
=========================== */
export const createUser = async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashed,
      isAdmin: isAdmin || false
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: `สร้างผู้ใช้ ${username} สำเร็จ`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};


/* ===========================
   GET ALL USERS
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};


/* ===========================
   UPDATE ROLE
=========================== */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'ข้อมูล role ไม่ถูกต้อง' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json({
      status: 'success',
      user
    });

  } catch (err) {
    res.status(500).json({ message: 'อัปเดต role ไม่สำเร็จ' });
  }
};


/* ===========================
   CHANGE PASSWORD
=========================== */
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'รหัสผ่านต้องอย่างน้อย 6 ตัว' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      id,
      { password: hashed },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json({ status: 'success' });

  } catch (err) {
    res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
  }
};


/* ===========================
   DELETE USER
=========================== */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json({
      status: 'success',
      message: `ลบ ${user.username} แล้ว`
    });

  } catch (err) {
    res.status(500).json({ message: 'ลบไม่สำเร็จ' });
  }
};


/* ===========================
   UPDATE PROFILE
=========================== */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { username, email, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json({
      status: 'success',
      user
    });

  } catch (err) {
    res.status(500).json({ message: 'อัปเดตไม่สำเร็จ' });
  }
};


/* ===========================
   IMPORT USERS EXCEL / CSV
=========================== */
export const importUsersFromFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    let rows = [];

    if (filePath.endsWith('.xlsx')) {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    }

    if (filePath.endsWith('.csv')) {
      rows = await new Promise(resolve => {
        const result = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', d => result.push(d))
          .on('end', () => resolve(result));
      });
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of rows) {
      if (!r.username || !r.password) {
        skipped++;
        continue;
      }

      const exists = await User.findOne({ username: r.username });
      if (exists) {
        skipped++;
        continue;
      }

      const hashed = await bcrypt.hash(r.password.toString(), 10);

      await User.create({
        username: r.username,
        password: hashed,
        isAdmin: false
      });

      inserted++;
    }

    res.json({
      status: 'success',
      inserted,
      skipped,
      total: rows.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import ไม่สำเร็จ' });
  }
};
