import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetAudience: [String],
  imageUrl: String,
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("ServiceItem", serviceItemSchema);
