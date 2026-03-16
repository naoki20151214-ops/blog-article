const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET tasks for a specific KPI
router.get('/kpi/:kpiId', async (req, res) => {
  try {
    const tasks = await Task.find({ kpiId: req.params.kpiId }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
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

    const newTask = new Task({
      id,
      kpiId,
      name,
      description: description || '',
      completed: false,
      order: order || 0,
      autoSyncValue: autoSyncValue || 0,
      tags: tags || [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Task with this id already exists' });
    }
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

    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (name) task.name = name;
    if (description !== undefined) task.description = description;
    if (order !== undefined) task.order = order;
    if (autoSyncValue !== undefined) task.autoSyncValue = autoSyncValue;
    if (tags) task.tags = tags;
    task.modifiedAt = new Date();

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT toggle task completion
router.put('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    task.modifiedAt = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.deleteOne({ id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
