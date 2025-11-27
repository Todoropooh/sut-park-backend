import Employee from "../models/Employee.js";

// 1. ดึงข้อมูลพนักงานทั้งหมด
export const getEmployees = async (req, res) => {
  try {
    // เรียงตามวันที่สร้างล่าสุด (ใหม่ไปเก่า)
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
    // ดักจับ Error รหัสพนักงานซ้ำ (Duplicate Key)
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
      { new: true } // คืนค่าข้อมูลใหม่หลังแก้เสร็จ
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

// 5. ⭐️ นำเข้าข้อมูลหลายคน (Import Excel/JSON)
export const importEmployees = async (req, res) => {
  try {
    const employeesData = req.body; // รับ Array ข้อมูลเข้ามา

    // ตรวจสอบว่าเป็น Array หรือไม่
    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return res.status(400).json({ message: "ไม่พบข้อมูล หรือรูปแบบข้อมูลไม่ถูกต้อง" });
    }

    // ใช้ insertMany โดยระบุ ordered: false
    // แปลว่า: ถ้าเจอคนซ้ำ (Error) ให้ข้ามคนนั้นไป แล้วทำคนถัดไปต่อจนจบ ไม่หยุดทำงานกลางคัน
    const result = await Employee.insertMany(employeesData, { ordered: false });

    res.status(201).json({ 
      message: "นำเข้าข้อมูลสำเร็จทั้งหมด", 
      count: result.length,
      data: result
    });

  } catch (err) {
    // กรณีที่มีบางคนซ้ำ (Mongoose จะ throw error ออกมาพร้อมผลลัพธ์ของคนที่ทำสำเร็จ)
    if (err.code === 11000 || err.writeErrors) {
        // err.insertedDocs คือรายการที่บันทึกสำเร็จ
        const successCount = err.insertedDocs ? err.insertedDocs.length : 0;
        
        return res.status(200).json({ 
            message: `นำเข้าสำเร็จบางส่วน (${successCount} รายการ), มีบางรายการซ้ำหรือผิดพลาด`,
            count: successCount,
            partial: true // ส่ง flag บอกหน้าบ้านว่าสำเร็จไม่หมดนะ
        });
    }
    
    // Error อื่นๆ
    console.error("Import Error:", err);
    res.status(500).json({ message: err.message });
  }
};