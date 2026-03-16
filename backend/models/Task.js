const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  kpiId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  autoSyncValue: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
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

module.exports = mongoose.model('Task', taskSchema);
