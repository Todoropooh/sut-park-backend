// controllers/serviceItemController.js
import ServiceItem from "../models/ServiceItem.js";

// --- Public API ---
export const getPublicServiceItems = async (req, res) => {
  try {
    const services = await ServiceItem.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
  }
};

// --- Admin API ---
export const createServiceItem = async (req, res) => {
  try {
    const { title, description, category, fundingAmount, targetAudience, deadline, imageUrl } = req.body;

    // แปลง targetAudience จาก string -> array
    let audienceArray = [];
    if (targetAudience) {
      if (Array.isArray(targetAudience)) {
        audienceArray = targetAudience;
      } else if (typeof targetAudience === "string") {
        audienceArray = targetAudience.split(",").map(item => item.trim()).filter(item => item);
      }
    }

    const newService = new ServiceItem({
      title,
      description,
      category,
      fundingAmount: fundingAmount || 0,
      targetAudience: audienceArray,
      deadline: deadline || null,
      imageUrl: imageUrl || "",
    });

    await newService.save();
    res.status(201).json({ success: true, data: newService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "เกิดข้อผิดพลาดในการสร้างรายการ" });
  }
};

export const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, fundingAmount, targetAudience, deadline, imageUrl } = req.body;

    let audienceArray = [];
    if (targetAudience) {
      if (Array.isArray(targetAudience)) {
        audienceArray = targetAudience;
      } else if (typeof targetAudience === "string") {
        audienceArray = targetAudience.split(",").map(item => item.trim()).filter(item => item);
      }
    }

    const updatedService = await ServiceItem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        fundingAmount: fundingAmount || 0,
        targetAudience: audienceArray,
        deadline: deadline || null,
        imageUrl: imageUrl || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedService) return res.status(404).json({ success: false, message: "ไม่พบรายการที่ต้องการแก้ไข" });

    res.json({ success: true, data: updatedService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "เกิดข้อผิดพลาดในการแก้ไขรายการ" });
  }
};

export const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await ServiceItem.findByIdAndDelete(id);

    if (!deletedService) return res.status(404).json({ success: false, message: "ไม่พบรายการที่ต้องการลบ" });

    res.json({ success: true, message: "ลบรายการสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "เกิดข้อผิดพลาดในการลบรายการ" });
  }
};
