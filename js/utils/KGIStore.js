/**
 * KGIStore - Centralized state management for KGI system
 * Manages KPI values, task queue, and change history
 */

class KGIStore {
  constructor(configManager) {
    this.configManager = configManager;
    this.taskQueue = [];
    this.changeHistory = [];
    this.listeners = [];
    this.initialize();
  }

  /**
   * Initialize store from localStorage
   */
  initialize() {
    // Load task queue
    const queueJson = localStorage.getItem('kgi_task_queue');
    this.taskQueue = queueJson ? JSON.parse(queueJson) : [];

    // Load change history
    const historyJson = localStorage.getItem('kgi_history');
    this.changeHistory = historyJson ? JSON.parse(historyJson) : [];

    // Load KPI current values from localStorage (for backward compatibility)
    const config = this.configManager.getConfig();
    config.kpis.forEach(kpi => {
      if (kpi.storageKey) {
        const storedValue = localStorage.getItem(kpi.storageKey);
        if (storedValue !== null) {
          kpi.current = parseInt(storedValue) || 0;
        }
      }
    });

    console.log('✅ KGIStore initialized');
  }

  /**
   * Get KPI current value
   */
  getKPIValue(kpiId) {
    const kpi = this.configManager.getKPI(kpiId);
    return kpi ? kpi.current : 0;
  }

  /**
   * Update KPI value
   */
  setKPIValue(kpiId, newValue) {
    const kpi = this.configManager.getKPI(kpiId);
    if (!kpi) {
      throw new Error('KPI not found: ' + kpiId);
    }

    // Clamp value between 0 and target
    newValue = Math.max(0, Math.min(newValue, kpi.target));

    const oldValue = kpi.current;
    if (oldValue === newValue) return; // No change

    // Update in config
    kpi.current = newValue;
    this.configManager.save();

    // Also update in legacy storage key for compatibility
    if (kpi.storageKey) {
      localStorage.setItem(kpi.storageKey, newValue.toString());
    }

    // Record change
    this.recordChange(kpiId, oldValue, newValue, 'manual');

    // Update subtask sync
    this.syncSubtasksToValue(kpiId, newValue);

    this.notifyListeners('kpi_value_changed', { kpiId, oldValue, newValue });
    return newValue;
  }

  /**
   * Increment KPI value
   */
  incrementKPI(kpiId, amount = 1) {
    const currentValue = this.getKPIValue(kpiId);
    return this.setKPIValue(kpiId, currentValue + amount);
  }

  /**
   * Decrement KPI value
   */
  decrementKPI(kpiId, amount = 1) {
    const currentValue = this.getKPIValue(kpiId);
    return this.setKPIValue(kpiId, currentValue - amount);
  }

  /**
   * Get KPI progress percentage
   */
  getKPIProgress(kpiId) {
    const kpi = this.configManager.getKPI(kpiId);
    if (!kpi || kpi.target === 0) return 0;
    return Math.round((kpi.current / kpi.target) * 100);
  }

  /**
   * Calculate overall KGI progress based on importance weights
   */
  calculateKGIProgress() {
    const kpis = this.configManager.getKPIs();
    const weights = this._calculateImportanceWeights();

    let totalProgress = 0;
    let totalWeight = 0;

    kpis.forEach(kpi => {
      const progress = this.getKPIProgress(kpi.id);
      const weight = weights[kpi.id] || 1;
      totalProgress += progress * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
  }

  /**
   * Calculate importance weights (A=3, B=2, C=1)
   */
  _calculateImportanceWeights() {
    const kpis = this.configManager.getKPIs();
    const weights = {};
    const importanceMap = { A: 3, B: 2, C: 1 };

    kpis.forEach(kpi => {
      weights[kpi.id] = importanceMap[kpi.importance] || 2;
    });

    return weights;
  }

  /**
   * Record a change in history
   */
  recordChange(kpiId, oldValue, newValue, source, subtaskId = null) {
    const change = {
      timestamp: Date.now(),
      kpiId: kpiId,
      oldValue: oldValue,
      newValue: newValue,
      changeAmount: newValue - oldValue,
      source: source,
      subtaskId: subtaskId
    };

    this.changeHistory.push(change);
    this._saveHistory();
    this.notifyListeners('change_recorded', change);
  }

  /**
   * Get change history for a KPI
   */
  getKPIHistory(kpiId) {
    return this.changeHistory.filter(change => change.kpiId === kpiId);
  }

  /**
   * Get all changes in history
   */
  getAllHistory() {
    return [...this.changeHistory];
  }

  /**
   * Get change statistics for a KPI
   */
  getKPIStats(kpiId) {
    const history = this.getKPIHistory(kpiId);
    return {
      totalChanges: history.length,
      totalIncrease: history.filter(c => c.changeAmount > 0).reduce((s, c) => s + c.changeAmount, 0),
      totalDecrease: Math.abs(history.filter(c => c.changeAmount < 0).reduce((s, c) => s + c.changeAmount, 0)),
      firstRecorded: history.length > 0 ? history[0].timestamp : null,
      lastChanged: history.length > 0 ? history[history.length - 1].timestamp : null
    };
  }

  /**
   * Save history to localStorage
   */
  _saveHistory() {
    localStorage.setItem('kgi_history', JSON.stringify(this.changeHistory));
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.changeHistory = [];
    this._saveHistory();
    this.notifyListeners('history_cleared');
  }

  /**
   * ===== TASK QUEUE SYSTEM =====
   */

  /**
   * Get task queue
   */
  getTaskQueue() {
    return [...this.taskQueue];
  }

  /**
   * Check if task is in queue
   */
  isTaskInQueue(kpiId, taskId) {
    return this.taskQueue.some(t => t.kpiId === kpiId && t.taskId === taskId);
  }

  /**
   * Add task to queue
   */
  addTaskToQueue(kpiId, taskId) {
    const config = this.configManager.getConfig();
    const task = this.configManager.getTask(taskId);
    const kpi = this.configManager.getKPI(kpiId);

    if (!task || !kpi) {
      throw new Error('Task or KPI not found');
    }

    if (this.isTaskInQueue(kpiId, taskId)) {
      throw new Error('Task already in queue');
    }

    const queueItem = {
      queueId: 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      kpiId: kpiId,
      taskId: taskId,
      taskName: task.name,
      addedAt: Date.now(),
      completed: false
    };

    this.taskQueue.push(queueItem);
    this._saveQueue();
    this.notifyListeners('task_added_to_queue', queueItem);
    return queueItem;
  }

  /**
   * Remove task from queue
   */
  removeTaskFromQueue(queueId) {
    const index = this.taskQueue.findIndex(t => t.queueId === queueId);
    if (index === -1) {
      throw new Error('Queue item not found');
    }

    const removed = this.taskQueue[index];
    this.taskQueue.splice(index, 1);
    this._saveQueue();
    this.notifyListeners('task_removed_from_queue', removed);
  }

  /**
   * Complete task from queue
   */
  completeQueueTask(queueId) {
    const queueItem = this.taskQueue.find(t => t.queueId === queueId);
    if (!queueItem) {
      throw new Error('Queue item not found');
    }

    // Toggle task completion
    const task = this.configManager.getTask(queueItem.taskId);
    if (task) {
      task.completed = !task.completed;
      this.configManager.save();
    }

    // If auto-sync is enabled, update KPI value
    if (task && task.autoSyncValue && task.completed) {
      // Task was just completed, increment KPI
      this.incrementKPI(queueItem.kpiId, task.autoSyncValue);
    } else if (task && task.autoSyncValue && !task.completed) {
      // Task was just uncompleted, decrement KPI
      this.decrementKPI(queueItem.kpiId, task.autoSyncValue);
    }

    // Remove from queue
    this.removeTaskFromQueue(queueId);

    this.notifyListeners('queue_task_completed', queueItem);
  }

  /**
   * Save queue to localStorage
   */
  _saveQueue() {
    localStorage.setItem('kgi_task_queue', JSON.stringify(this.taskQueue));
  }

  /**
   * ===== SUBTASK SYNCHRONIZATION =====
   */

  /**
   * Sync subtasks to KPI value
   */
  syncSubtasksToValue(kpiId, value) {
    const kpi = this.configManager.getKPI(kpiId);
    if (!kpi || kpi.subtaskSyncType !== 'auto') return;

    const tasks = this.configManager.getTasksByKPI(kpiId);
    const chunkSize = kpi.subtaskChunkSize || 1;
    const tasksToComplete = Math.floor(value / chunkSize);

    tasks.forEach((task, index) => {
      task.completed = index < tasksToComplete;
    });

    this.configManager.save();
  }

  /**
   * Toggle task completion
   */
  toggleTaskCompletion(taskId) {
    const task = this.configManager.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.completed = !task.completed;
    this.configManager.save();

    // Auto-sync if applicable
    const kpi = this.configManager.getKPI(task.kpiId);
    if (kpi && kpi.subtaskSyncType === 'auto' && task.autoSyncValue) {
      const oldValue = kpi.current;
      const completedCount = this.configManager.getTasksByKPI(task.kpiId)
        .filter(t => t.completed).length;
      const newValue = completedCount * task.autoSyncValue;

      kpi.current = Math.min(newValue, kpi.target);
      this.configManager.save();
      this.recordChange(task.kpiId, oldValue, kpi.current, 'subtask', taskId);
    }

    this.notifyListeners('task_completion_toggled', task);
    return task;
  }

  /**
   * ===== EVENT LISTENERS =====
   */

  /**
   * Subscribe to store changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  }

  /**
   * ===== RESET FUNCTIONS =====
   */

  /**
   * Reset KPI value to 0
   */
  resetKPI(kpiId) {
    return this.setKPIValue(kpiId, 0);
  }

  /**
   * Reset all KPIs
   */
  resetAllKPIs() {
    const kpis = this.configManager.getKPIs();
    kpis.forEach(kpi => {
      this.setKPIValue(kpi.id, 0);
    });
    this.notifyListeners('all_kpis_reset');
  }

  /**
   * Reset all data (including history and queue)
   */
  resetAll() {
    this.changeHistory = [];
    this._saveHistory();
    this.taskQueue = [];
    this._saveQueue();
    this.resetAllKPIs();
    this.notifyListeners('all_data_reset');
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KGIStore;
}
