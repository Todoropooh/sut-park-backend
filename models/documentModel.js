// models/documentModel.js (Updated - Added Soft Delete)

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalFilename: { 
    type: String, 
    required: true 
  },
  storedFilename: { 
    type: String, 
    required: true, 
    unique: true 
  },
  path: { // (Path that we use in Multer /uploads/documents/...)
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  },
  
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder', // ⭐️ Points to the 'Folder' Model
    default: null, // ⭐️ null = in Root
  },
  
  size: {
    type: Number,
    default: 0
  },

  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },

  // ⭐️⭐️⭐️ (Added these 2 fields) ⭐️⭐️⭐️
  isDeleted: {
    type: Boolean,
    default: false,
    index: true 
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.model('Document', documentSchema);