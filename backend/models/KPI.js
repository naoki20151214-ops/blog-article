const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  kgiId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '📊',
  },
  type: {
    type: String,
    enum: ['manual', 'inventory', 'formula'],
    default: 'manual',
  },
  target: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: '',
  },
  importance: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'A',
  },
  order: {
    type: Number,
    default: 0,
  },
  subtaskSyncType: {
    type: String,
    default: 'auto',
  },
  subtaskChunkSize: {
    type: Number,
    default: 10,
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

module.exports = mongoose.model('KPI', kpiSchema);
