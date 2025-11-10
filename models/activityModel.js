// models/activityModel.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String } 
});

module.exports = mongoose.model('Activity', activitySchema);