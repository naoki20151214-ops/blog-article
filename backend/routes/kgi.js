const express = require('express');
const router = express.Router();
const KGI = require('../models/KGI');
const KPI = require('../models/KPI');
const Task = require('../models/Task');
const ChangeHistory = require('../models/ChangeHistory');
const { getDB } = require('../config/firebase');

// GET all KGIs
router.get('/', async (req, res) => {
  try {
    const kgis = await KGI.findAll();
    // Sort by createdAt descending
    kgis.sort((a, b) => b.createdAt - a.createdAt);
    res.json(kgis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific KGI
router.get('/:id', async (req, res) => {
  try {
    const kgi = await KGI.findById(req.params.id);
    if (!kgi) {
      return res.status(404).json({ error: 'KGI not found' });
    }
    res.json(kgi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create KGI
router.post('/', async (req, res) => {
  try {
    const { id, name, emoji, description } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'id and name are required' });
    }

    // Check if KGI already exists
    const existing = await KGI.findById(id);
    if (existing) {
      return res.status(400).json({ error: 'KGI with this id already exists' });
    }

    const newKGI = await KGI.create({
      id,
      name,
      emoji: emoji || '🎯',
      description: description || '',
    });

    res.status(201).json(newKGI);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update KGI
router.put('/:id', async (req, res) => {
  try {
    const { name, emoji, description } = req.body;

    const kgi = await KGI.findById(req.params.id);
    if (!kgi) {
      return res.status(404).json({ error: 'KGI not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (emoji) updateData.emoji = emoji;
    if (description !== undefined) updateData.description = description;

    const updated = await KGI.updateById(req.params.id, updateData);
    const result = await KGI.findById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KGI and related data
router.delete('/:id', async (req, res) => {
  try {
    const kgi = await KGI.findById(req.params.id);
    if (!kgi) {
      return res.status(404).json({ error: 'KGI not found' });
    }

    // Delete all KPIs associated with this KGI
    const kpis = await KPI.findByKgiId(req.params.id);
    const kpiIds = kpis.map(kpi => kpi.id);

    const db = getDB();

    // Delete all tasks associated with these KPIs
    if (kpiIds.length > 0) {
      for (const kpiId of kpiIds) {
        const tasks = await Task.findByKpiId(kpiId);
        for (const task of tasks) {
          await Task.deleteById(task.id);
        }
      }
    }

    // Delete all history associated with these KPIs
    if (kpiIds.length > 0) {
      for (const kpiId of kpiIds) {
        const histories = await ChangeHistory.findByKpiId(kpiId);
        const historyCollection = db.collection(ChangeHistory.COLLECTION);
        for (const history of histories) {
          await historyCollection.doc(history.id).delete();
        }
      }
    }

    // Delete KPIs
    for (const kpiId of kpiIds) {
      await KPI.deleteById(kpiId);
    }

    // Delete KGI
    await KGI.deleteById(req.params.id);

    res.json({ message: 'KGI deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
