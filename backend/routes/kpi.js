const express = require('express');
const router = express.Router();
const KPI = require('../models/KPI');
const Task = require('../models/Task');
const ChangeHistory = require('../models/ChangeHistory');
const { getDB } = require('../config/firebase');

// GET KPIs for a specific KGI
router.get('/kgi/:kgiId', async (req, res) => {
  try {
    const kpis = await KPI.findByKgiId(req.params.kgiId);
    // Sort by order
    kpis.sort((a, b) => a.order - b.order);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific KPI
router.get('/:id', async (req, res) => {
  try {
    const kpi = await KPI.findById(req.params.id);
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

    // Check if KPI already exists
    const existing = await KPI.findById(id);
    if (existing) {
      return res.status(400).json({ error: 'KPI with this id already exists' });
    }

    const newKPI = await KPI.create({
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
    });

    res.status(201).json(newKPI);
  } catch (error) {
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

    const kpi = await KPI.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (emoji) updateData.emoji = emoji;
    if (type) updateData.type = type;
    if (target !== undefined) updateData.target = target;
    if (unit !== undefined) updateData.unit = unit;
    if (importance) updateData.importance = importance;
    if (order !== undefined) updateData.order = order;
    if (subtaskSyncType) updateData.subtaskSyncType = subtaskSyncType;
    if (subtaskChunkSize) updateData.subtaskChunkSize = subtaskChunkSize;

    await KPI.updateById(req.params.id, updateData);
    const result = await KPI.findById(req.params.id);
    res.json(result);
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

    const kpi = await KPI.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const oldValue = kpi.current;
    const newValue = value;
    const changeAmount = newValue - oldValue;

    await KPI.updateById(req.params.id, { current: newValue });

    // Record change history
    const history = await ChangeHistory.create({
      kpiId: req.params.id,
      oldValue,
      newValue,
      changeAmount,
      source: source || 'manual',
      subtaskId: subtaskId || null,
    });

    const updatedKpi = await KPI.findById(req.params.id);
    res.json({ kpi: updatedKpi, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KPI and related data
router.delete('/:id', async (req, res) => {
  try {
    const kpi = await KPI.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const db = getDB();

    // Delete all tasks
    const tasks = await Task.findByKpiId(req.params.id);
    for (const task of tasks) {
      await Task.deleteById(task.id);
    }

    // Delete all history
    const histories = await ChangeHistory.findByKpiId(req.params.id);
    const historyCollection = db.collection(ChangeHistory.COLLECTION);
    for (const history of histories) {
      await historyCollection.doc(history.id).delete();
    }

    // Delete KPI
    await KPI.deleteById(req.params.id);

    res.json({ message: 'KPI deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET change history for a KPI
router.get('/:id/history', async (req, res) => {
  try {
    const history = await ChangeHistory.findByKpiId(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
