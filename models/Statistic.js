import mongoose from 'mongoose';

const StatisticSchema = new mongoose.Schema({
  employment: { type: Number, default: 0 },
  smes: { type: Number, default: 0 },
  enrollment: { type: Number, default: 0 },
  products: { type: Number, default: 0 },
  income: { type: Number, default: 0 },
  awards: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Statistic', StatisticSchema);