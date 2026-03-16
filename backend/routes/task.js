const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET tasks for a specific KPI
router.get('/kpi/:kpiId', async (req, res) => {
  try {
    const tasks = await Task.findByKpiId(req.params.kpiId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const {
      id,
      kpiId,
      name,
      description,
      order,
      autoSyncValue,
      tags,
    } = req.body;

    if (!id || !kpiId || !name) {
      return res.status(400).json({ error: 'id, kpiId, and name are required' });
    }

    // Check if task already exists
    const existing = await Task.findById(id);
    if (existing) {
      return res.status(400).json({ error: 'Task with this id already exists' });
    }

    const newTask = await Task.create({
      id,
      kpiId,
      name,
      description: description || '',
      completed: false,
      order: order || 0,
      autoSyncValue: autoSyncValue || 0,
      tags: tags || [],
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      order,
      autoSyncValue,
      tags,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (autoSyncValue !== undefined) updateData.autoSyncValue = autoSyncValue;
    if (tags) updateData.tags = tags;

    await Task.updateById(req.params.id, updateData);
    const result = await Task.findById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT toggle task completion
router.put('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.updateById(req.params.id, { completed: !task.completed });
    const result = await Task.findById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.deleteById(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
