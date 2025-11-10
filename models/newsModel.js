// models/newsModel.js

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, 
    content: { type: String, required: true },
    imageUrl: { type: String }, 
    publishedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);