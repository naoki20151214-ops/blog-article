const express = require('express');
const router = express.Router();
const KGI = require('../models/KGI');
const KPI = require('../models/KPI');
const Task = require('../models/Task');
const ChangeHistory = require('../models/ChangeHistory');

// GET all KGIs
router.get('/', async (req, res) => {
  try {
    const kgis = await KGI.find().sort({ createdAt: -1 });
    res.json(kgis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific KGI
router.get('/:id', async (req, res) => {
  try {
    const kgi = await KGI.findOne({ id: req.params.id });
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

    const newKGI = new KGI({
      id,
      name,
      emoji: emoji || '🎯',
      description: description || '',
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    await newKGI.save();
    res.status(201).json(newKGI);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'KGI with this id already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update KGI
router.put('/:id', async (req, res) => {
  try {
    const { name, emoji, description } = req.body;

    const kgi = await KGI.findOne({ id: req.params.id });
    if (!kgi) {
      return res.status(404).json({ error: 'KGI not found' });
    }

    if (name) kgi.name = name;
    if (emoji) kgi.emoji = emoji;
    if (description !== undefined) kgi.description = description;
    kgi.modifiedAt = new Date();

    await kgi.save();
    res.json(kgi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KGI and related data
router.delete('/:id', async (req, res) => {
  try {
    const kgi = await KGI.findOne({ id: req.params.id });
    if (!kgi) {
      return res.status(404).json({ error: 'KGI not found' });
    }

    // Delete all KPIs associated with this KGI
    const kpis = await KPI.find({ kgiId: req.params.id });
    const kpiIds = kpis.map(kpi => kpi.id);

    // Delete all tasks associated with these KPIs
    if (kpiIds.length > 0) {
      await Task.deleteMany({ kpiId: { $in: kpiIds } });
    }

    // Delete all history associated with these KPIs
    if (kpiIds.length > 0) {
      await ChangeHistory.deleteMany({ kpiId: { $in: kpiIds } });
    }

    // Delete KPIs
    await KPI.deleteMany({ kgiId: req.params.id });

    // Delete KGI
    await KGI.deleteOne({ id: req.params.id });

    res.json({ message: 'KGI deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
