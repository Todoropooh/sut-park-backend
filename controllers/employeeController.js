// src/controllers/employeeController.js

import Employee from '../models/Employee.js'; // เช็คชื่อไฟล์ให้ตรง (E ใหญ่)
import mongoose from 'mongoose';

// --- 1. Get All ---
export const getEmployees = async (req, res) => {
  try {
    // 🟢 [FINAL] ปิดโหมดกู้ชีพแล้ว (ลบ updateMany ออก)
    // ดึงข้อมูลทั้งหมด ที่สถานะ "ไม่ใช่ถูกลบ" (รวมถึงข้อมูลเก่าที่ไม่มี field นี้ด้วย)
    const employees = await Employee.find({ 
        isDeleted: { $ne: true } 
    }).sort({ createdAt: -1 });
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 2. Get By ID ---
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findOne({ 
        _id: id, 
        isDeleted: { $ne: true } 
    });
    
    if (!employee) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 3. Create ---
export const createEmployee = async (req, res) => {
  try {
    const { 
        employeeId, firstName, lastName, firstNameEn, lastNameEn, 
        position, division, email, phoneNumber 
    } = req.body;

    const imageUrl = req.file ? req.file.path : null;

    if (!employeeId || !firstName || !lastName) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลสำคัญให้ครบ" });
    }

    const newEmployee = new Employee({
        employeeId, firstName, lastName, firstNameEn, lastNameEn,
        position, division,
        email,        
        phoneNumber,  
        imageUrl,     
        isDeleted: false 
    });

    await newEmployee.save();
    res.status(201).json({ status: "success", message: "เพิ่มพนักงานสำเร็จ" });

  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.status(400).json({ message: "รหัสพนักงานนี้มีอยู่แล้ว" });
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์" });
  }
};

// --- 4. Update ---
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
        employeeId, firstName, lastName, firstNameEn, lastNameEn, 
        position, division, email, phoneNumber 
    } = req.body;

    const updateData = {
        employeeId, firstName, lastName, firstNameEn, lastNameEn,
        position, division,
        email,      
        phoneNumber 
    };

    if (req.file) {
        updateData.imageUrl = req.file.path;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedEmployee) return res.status(404).json({ message: "ไม่พบข้อมูล" });

    res.json({ status: "success", message: "แก้ไขข้อมูลสำเร็จ", data: updatedEmployee });

  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 5. Delete (Soft Delete) ---
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndUpdate(id, { 
        isDeleted: true, 
        deletedAt: new Date(),
        deletedBy: req.user ? req.user._id : null 
    });
    res.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// --- 6. Import ---
export const importEmployees = async (req, res) => {
    try {
        const employees = req.body;
        if (!Array.isArray(employees)) return res.status(400).json({ message: "Format ข้อมูลไม่ถูกต้อง" });

        let count = 0;
        for (const emp of employees) {
            const exists = await Employee.findOne({ employeeId: emp.employeeId });
            if (!exists) {
                await new Employee({ ...emp, isDeleted: false }).save();
                count++;
            }
        }
        res.json({ message: "Import สำเร็จ", count });
    } catch (error) {
        res.status(500).json({ message: "Import ล้มเหลว" });
    }
};