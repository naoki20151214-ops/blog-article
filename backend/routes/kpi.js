const express = require('express');
const router = express.Router();
const KPI = require('../models/KPI');
const Task = require('../models/Task');
const ChangeHistory = require('../models/ChangeHistory');

// GET KPIs for a specific KGI
router.get('/kgi/:kgiId', async (req, res) => {
  try {
    const kpis = await KPI.find({ kgiId: req.params.kgiId }).sort({ order: 1 });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific KPI
router.get('/:id', async (req, res) => {
  try {
    const kpi = await KPI.findOne({ id: req.params.id });
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create KPI
router.post('/', async (req, res) => {
  try {
    const {
      id,
      kgiId,
      name,
      emoji,
      type,
      target,
      unit,
      importance,
      order,
      subtaskSyncType,
      subtaskChunkSize,
    } = req.body;

    if (!id || !kgiId || !name || target === undefined) {
      return res.status(400).json({ error: 'id, kgiId, name, and target are required' });
    }

    const newKPI = new KPI({
      id,
      kgiId,
      name,
      emoji: emoji || '📊',
      type: type || 'manual',
      target,
      current: 0,
      unit: unit || '',
      importance: importance || 'A',
      order: order || 0,
      subtaskSyncType: subtaskSyncType || 'auto',
      subtaskChunkSize: subtaskChunkSize || 10,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    await newKPI.save();
    res.status(201).json(newKPI);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'KPI with this id already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update KPI
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      emoji,
      type,
      target,
      unit,
      importance,
      order,
      subtaskSyncType,
      subtaskChunkSize,
    } = req.body;

    const kpi = await KPI.findOne({ id: req.params.id });
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    if (name) kpi.name = name;
    if (emoji) kpi.emoji = emoji;
    if (type) kpi.type = type;
    if (target !== undefined) kpi.target = target;
    if (unit !== undefined) kpi.unit = unit;
    if (importance) kpi.importance = importance;
    if (order !== undefined) kpi.order = order;
    if (subtaskSyncType) kpi.subtaskSyncType = subtaskSyncType;
    if (subtaskChunkSize) kpi.subtaskChunkSize = subtaskChunkSize;
    kpi.modifiedAt = new Date();

    await kpi.save();
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update KPI value and record history
router.put('/:id/value', async (req, res) => {
  try {
    const { value, source, subtaskId } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }

    const kpi = await KPI.findOne({ id: req.params.id });
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const oldValue = kpi.current;
    const newValue = value;
    const changeAmount = newValue - oldValue;

    kpi.current = newValue;
    kpi.modifiedAt = new Date();
    await kpi.save();

    // Record change history
    const history = new ChangeHistory({
      timestamp: new Date(),
      kpiId: req.params.id,
      oldValue,
      newValue,
      changeAmount,
      source: source || 'manual',
      subtaskId: subtaskId || null,
    });
    await history.save();

    res.json({ kpi, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KPI and related data
router.delete('/:id', async (req, res) => {
  try {
    const kpi = await KPI.findOne({ id: req.params.id });
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    // Delete all tasks
    await Task.deleteMany({ kpiId: req.params.id });

    // Delete all history
    await ChangeHistory.deleteMany({ kpiId: req.params.id });

    // Delete KPI
    await KPI.deleteOne({ id: req.params.id });

    res.json({ message: 'KPI deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET change history for a KPI
router.get('/:id/history', async (req, res) => {
  try {
    const history = await ChangeHistory.find({ kpiId: req.params.id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
