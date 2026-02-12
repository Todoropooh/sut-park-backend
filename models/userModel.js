import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

  // ข้อมูลล็อกอิน
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  // สิทธิ์ผู้ใช้
  isAdmin: { 
    type: Boolean, 
    default: false 
  },

  // 🟢 ข้อมูลติดต่อ
  email: { 
    type: String, 
    default: "" 
  },

  phone: { 
    type: String, 
    default: "" 
  },

  // 🟢 รูปโปรไฟล์
  imageUrl: { 
    type: String, 
    default: "" 
  },

  // ⭐ Soft Delete
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true 
  },

  deletedAt: { 
    type: Date, 
    default: null 
  },

  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }

}, { timestamps: true });


// 🔐 Hash password อัตโนมัติ
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


// 🔍 ใช้ตรวจรหัสผ่านตอน login
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};


export default mongoose.model('User', userSchema);
