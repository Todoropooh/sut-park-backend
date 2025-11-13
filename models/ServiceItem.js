// models/ServiceItem.js
import mongoose from "mongoose";

const ServiceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "สร้าง STARTUP",
        "ส่งเสริม SME",
        "สนับสนุนวิสาหกิจชุมชน",
        "เพิ่มศักยภาพ ENTERPRISE",
        "มุ่งสู่ GLOBAL",
        "อื่นๆ",
      ],
    },
    fundingAmount: {
      type: Number,
      default: 0,
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // สร้าง createdAt และ updatedAt อัตโนมัติ
  }
);

const ServiceItem = mongoose.model("ServiceItem", ServiceItemSchema);
export default ServiceItem;
