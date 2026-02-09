// อย่าลืมเติม .js ต่อท้ายชื่อไฟล์ตอน import ด้วยนะครับ
import Statistic from '../models/Statistic.js'; 

export const getStats = async (req, res) => {
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

export const updateStats = async (req, res) => {
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