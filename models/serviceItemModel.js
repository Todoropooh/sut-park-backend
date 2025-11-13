import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  fundingAmount: { type: Number, default: 0 },
  targetAudience: { type: [String], default: [] },
  deadline: { type: Date },
  imageUrl: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("ServiceItem", serviceItemSchema);
