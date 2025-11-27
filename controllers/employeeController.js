import Employee from "../models/Employee.js";

// 1. ดึงข้อมูลพนักงานทั้งหมด
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. เพิ่มพนักงานใหม่ (ทีละคน)
export const createEmployee = async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" });
    }
    res.status(400).json({ message: err.message });
  }
};

// 3. แก้ไขข้อมูลพนักงาน
export const updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. ลบพนักงาน
export const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "ลบข้อมูลพนักงานเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. ⭐️ นำเข้าข้อมูลหลายคน (Import Excel)
export const importEmployees = async (req, res) => {
  try {
    const employeesData = req.body; // รับ Array เข้ามา

    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return res.status(400).json({ message: "ไม่พบข้อมูล หรือรูปแบบข้อมูลไม่ถูกต้อง" });
    }

    // insertMany โดยใช้ option { ordered: false } 
    // แปลว่า: ถ้าคนไหน Error (เช่น รหัสซ้ำ) ให้ข้ามคนนั้นไป แล้วทำคนถัดไปต่อจนจบ ไม่ต้องหยุดทำงาน
    // แต่ถ้าอยากให้หยุดทันทีที่เจอ Error ให้ลบ { ordered: false } ออก
    const result = await Employee.insertMany(employeesData, { ordered: false });

    res.status(201).json({ 
      message: "นำเข้าข้อมูลสำเร็จ", 
      count: result.length,
      data: result
    });

  } catch (err) {
    // ถ้าใช้ ordered: false แล้วมี error มันจะ throw error ออกมาพร้อมผลลัพธ์ที่สำเร็จบางส่วน
    if (err.code === 11000 || err.writeErrors) {
        return res.status(200).json({ 
            message: `นำเข้าสำเร็จบางส่วน (${err.insertedDocs?.length || 0} รายการ), พบข้อมูลซ้ำหรือผิดพลาดบางรายการ`,
            count: err.insertedDocs?.length || 0,
            partial: true
        });
    }
    res.status(500).json({ message: err.message });
  }
};