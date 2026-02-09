// backend/controllers/statisticController.js
const Statistic = require('../models/Statistic');

// 🟢 ฟังก์ชัน 1: ดึงข้อมูล (Get Stats)
exports.getStats = async (req, res) => {
  try {
    let stats = await Statistic.findOne();
    if (!stats) {
      stats = await Statistic.create({});
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 ฟังก์ชัน 2: บันทึกข้อมูล (Update Stats)
exports.updateStats = async (req, res) => {
  try {
    const updatedStats = await Statistic.findOneAndUpdate(
      {}, 
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json(updatedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};