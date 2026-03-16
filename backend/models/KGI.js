const mongoose = require('mongoose');

const kgiSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '🎯',
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('KGI', kgiSchema);
