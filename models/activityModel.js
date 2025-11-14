// models/activityModel.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
});

export default mongoose.model("Activity", activitySchema);
