const mongoose = require('mongoose');

const changeHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  kpiId: {
    type: String,
    required: true,
    index: true,
  },
  oldValue: {
    type: Number,
    required: true,
  },
  newValue: {
    type: Number,
    required: true,
  },
  changeAmount: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['manual', 'subtask', 'reset'],
    default: 'manual',
  },
  subtaskId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('ChangeHistory', changeHistorySchema);
