import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },      
  detail: { type: String },                       
  by: { type: String, required: true },           
  role: { type: String, default: 'User' },       
  timestamp: { type: Date, default: Date.now }    
});

const Log = mongoose.model("Log", logSchema);

// 👇 บรรทัดนี้สำคัญมาก! ต้องมีเพื่อให้ import Log from "..." ทำงานได้
export default Log;