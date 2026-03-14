/**
 * ConfigManager - Manages KGI system configuration
 * Handles loading, saving, and validating configuration
 */

class ConfigManager {
  constructor() {
    this.config = null;
    this.listeners = [];
  }

  /**
   * Initialize configuration from localStorage or use defaults
   */
  initialize() {
    // Try to load existing config
    const stored = localStorage.getItem('kgi_config');

    if (stored) {
      try {
        this.config = JSON.parse(stored);
        console.log('✅ Loaded existing configuration');
        return true;
      } catch (error) {
        console.error('Error loading configuration:', error);
        return false;
      }
    }

    // Check if migration is needed
    if (MigrationHelper.needsMigration()) {
      console.log('🔄 Migration detected');
      const migrationSuccess = MigrationHelper.performAutoMigration();
      if (migrationSuccess) {
        const stored = localStorage.getItem('kgi_config');
        this.config = JSON.parse(stored);
        return true;
      }
    }

    // No config and no migration needed - create default
    this.createDefaultConfig();
    return true;
  }

  /**
   * Create default configuration
   */
  createDefaultConfig() {
    this.config = {
      version: 2,
      createdAt: Date.now(),
      modifiedAt: Date.now(),

      kgi: {
        id: 'kgi_' + Date.now(),
        name: '来週のテストで100点を取る',
        emoji: '🎯',
        description: 'Test score target',
        createdAt: Date.now(),
        modifiedAt: Date.now()
      },

      kpis: [
        {
          id: 'kpi_1',
          kgiId: this.config?.kgi?.id || 'kgi_' + Date.now(),
          name: '📚 英単語',
          emoji: '📚',
          type: 'manual',
          target: 100,
          current: 0,
          unit: '個',
          importance: 'B',
          storageKey: 'kgi_vocab',
          importanceKey: 'kgi_importance_vocab',
          order: 0,
          subtaskSyncType: 'auto',
          subtaskChunkSize: 10,
          createdAt: Date.now(),
          modifiedAt: Date.now()
        },
        {
          id: 'kpi_2',
          kgiId: this.config?.kgi?.id || 'kgi_' + Date.now(),
          name: '📖 英文法',
          emoji: '📖',
          type: 'manual',
          target: 50,
          current: 0,
          unit: 'ページ',
          importance: 'B',
          storageKey: 'kgi_grammar',
          importanceKey: 'kgi_importance_grammar',
          order: 1,
          subtaskSyncType: 'auto',
          subtaskChunkSize: 10,
          createdAt: Date.now(),
          modifiedAt: Date.now()
        },
        {
          id: 'kpi_3',
          kgiId: this.config?.kgi?.id || 'kgi_' + Date.now(),
          name: '✏️ 過去問',
          emoji: '✏️',
          type: 'manual',
          target: 3,
          current: 0,
          unit: '回',
          importance: 'B',
          storageKey: 'kgi_practice',
          importanceKey: 'kgi_importance_practice',
          order: 2,
          subtaskSyncType: 'auto',
          subtaskChunkSize: 1,
          createdAt: Date.now(),
          modifiedAt: Date.now()
        }
      ],

      tasks: this._createDefaultTasks()
    };

    this.save();
    console.log('✅ Created default configuration');
  }

  /**
   * Create default tasks
   */
  _createDefaultTasks() {
    return [
      // Vocabulary tasks
      { id: 'task_1', kpiId: 'kpi_1', name: '単語 1-10', completed: false, order: 0, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_2', kpiId: 'kpi_1', name: '単語 11-20', completed: false, order: 1, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_3', kpiId: 'kpi_1', name: '単語 21-30', completed: false, order: 2, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_4', kpiId: 'kpi_1', name: '単語 31-40', completed: false, order: 3, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_5', kpiId: 'kpi_1', name: '単語 41-50', completed: false, order: 4, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_6', kpiId: 'kpi_1', name: '単語 51-60', completed: false, order: 5, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_7', kpiId: 'kpi_1', name: '単語 61-70', completed: false, order: 6, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_8', kpiId: 'kpi_1', name: '単語 71-80', completed: false, order: 7, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_9', kpiId: 'kpi_1', name: '単語 81-90', completed: false, order: 8, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_10', kpiId: 'kpi_1', name: '単語 91-100', completed: false, order: 9, autoSyncValue: 10, tags: ['vocab'], createdAt: Date.now(), modifiedAt: Date.now() },

      // Grammar tasks
      { id: 'task_11', kpiId: 'kpi_2', name: '文法 1-10ページ', completed: false, order: 0, autoSyncValue: 10, tags: ['grammar'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_12', kpiId: 'kpi_2', name: '文法 11-20ページ', completed: false, order: 1, autoSyncValue: 10, tags: ['grammar'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_13', kpiId: 'kpi_2', name: '文法 21-30ページ', completed: false, order: 2, autoSyncValue: 10, tags: ['grammar'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_14', kpiId: 'kpi_2', name: '文法 31-40ページ', completed: false, order: 3, autoSyncValue: 10, tags: ['grammar'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_15', kpiId: 'kpi_2', name: '文法 41-50ページ', completed: false, order: 4, autoSyncValue: 10, tags: ['grammar'], createdAt: Date.now(), modifiedAt: Date.now() },

      // Practice tasks
      { id: 'task_16', kpiId: 'kpi_3', name: '過去問を1回満点にする', completed: false, order: 0, autoSyncValue: 1, tags: ['practice'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_17', kpiId: 'kpi_3', name: '過去問を2回満点にする', completed: false, order: 1, autoSyncValue: 1, tags: ['practice'], createdAt: Date.now(), modifiedAt: Date.now() },
      { id: 'task_18', kpiId: 'kpi_3', name: '過去問を3回満点にする', completed: false, order: 2, autoSyncValue: 1, tags: ['practice'], createdAt: Date.now(), modifiedAt: Date.now() }
    ];
  }

  /**
   * Get the current configuration
   */
  getConfig() {
    if (!this.config) {
      this.initialize();
    }
    return this.config;
  }

  /**
   * Get KGI by ID
   */
  getKGI(kgiId = null) {
    const config = this.getConfig();
    if (kgiId) {
      return config.kgi.id === kgiId ? config.kgi : null;
    }
    return config.kgi;
  }

  /**
   * Get all KPIs
   */
  getKPIs() {
    return this.getConfig().kpis || [];
  }

  /**
   * Get KPI by ID
   */
  getKPI(kpiId) {
    const kpis = this.getKPIs();
    return kpis.find(kpi => kpi.id === kpiId);
  }

  /**
   * Get KPIs by KGI ID
   */
  getKPIsByKGI(kgiId) {
    return this.getKPIs().filter(kpi => kpi.kgiId === kgiId);
  }

  /**
   * Get all tasks
   */
  getTasks() {
    return this.getConfig().tasks || [];
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === taskId);
  }

  /**
   * Get tasks by KPI ID
   */
  getTasksByKPI(kpiId) {
    return this.getTasks().filter(task => task.kpiId === kpiId);
  }

  /**
   * Add new KPI
   */
  addKPI(kpiData) {
    if (!this.validateKPI(kpiData)) {
      throw new Error('Invalid KPI data');
    }

    const newKPI = {
      id: 'kpi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      kgiId: kpiData.kgiId || this.getConfig().kgi.id,
      name: kpiData.name,
      emoji: kpiData.emoji || '📊',
      type: kpiData.type || 'manual',
      target: kpiData.target || 100,
      current: kpiData.current || 0,
      unit: kpiData.unit || '',
      importance: kpiData.importance || 'B',
      order: this.getKPIs().length,
      subtaskSyncType: 'auto',
      subtaskChunkSize: kpiData.subtaskChunkSize || 1,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    this.getConfig().kpis.push(newKPI);
    this.save();
    this.notifyListeners('kpi_added', newKPI);
    return newKPI;
  }

  /**
   * Update KPI
   */
  updateKPI(kpiId, updates) {
    const kpi = this.getKPI(kpiId);
    if (!kpi) {
      throw new Error('KPI not found: ' + kpiId);
    }

    Object.assign(kpi, updates, { modifiedAt: Date.now() });
    this.save();
    this.notifyListeners('kpi_updated', kpi);
    return kpi;
  }

  /**
   * Delete KPI
   */
  deleteKPI(kpiId) {
    const config = this.getConfig();
    const index = config.kpis.findIndex(kpi => kpi.id === kpiId);

    if (index === -1) {
      throw new Error('KPI not found: ' + kpiId);
    }

    // Also delete tasks for this KPI
    config.tasks = config.tasks.filter(task => task.kpiId !== kpiId);

    config.kpis.splice(index, 1);
    this.save();
    this.notifyListeners('kpi_deleted', kpiId);
  }

  /**
   * Add new task
   */
  addTask(taskData) {
    if (!this.validateTask(taskData)) {
      throw new Error('Invalid task data');
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      kpiId: taskData.kpiId,
      name: taskData.name,
      description: taskData.description || '',
      completed: false,
      order: this.getTasksByKPI(taskData.kpiId).length,
      autoSyncValue: taskData.autoSyncValue || 1,
      tags: taskData.tags || [],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    this.getConfig().tasks.push(newTask);
    this.save();
    this.notifyListeners('task_added', newTask);
    return newTask;
  }

  /**
   * Update task
   */
  updateTask(taskId, updates) {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error('Task not found: ' + taskId);
    }

    Object.assign(task, updates, { modifiedAt: Date.now() });
    this.save();
    this.notifyListeners('task_updated', task);
    return task;
  }

  /**
   * Delete task
   */
  deleteTask(taskId) {
    const config = this.getConfig();
    const index = config.tasks.findIndex(task => task.id === taskId);

    if (index === -1) {
      throw new Error('Task not found: ' + taskId);
    }

    config.tasks.splice(index, 1);
    this.save();
    this.notifyListeners('task_deleted', taskId);
  }

  /**
   * Update KGI
   */
  updateKGI(updates) {
    const kgi = this.getConfig().kgi;
    Object.assign(kgi, updates, { modifiedAt: Date.now() });
    this.save();
    this.notifyListeners('kgi_updated', kgi);
    return kgi;
  }

  /**
   * Validate KPI data
   */
  validateKPI(kpiData) {
    if (!kpiData.name || typeof kpiData.name !== 'string' || kpiData.name.trim() === '') {
      return false;
    }

    if (kpiData.type && !['manual', 'inventory', 'formula'].includes(kpiData.type)) {
      return false;
    }

    if (typeof kpiData.target !== 'number' || kpiData.target <= 0) {
      return false;
    }

    if (kpiData.importance && !['A', 'B', 'C'].includes(kpiData.importance)) {
      return false;
    }

    return true;
  }

  /**
   * Validate task data
   */
  validateTask(taskData) {
    if (!taskData.name || typeof taskData.name !== 'string' || taskData.name.trim() === '') {
      return false;
    }

    if (!taskData.kpiId || !this.getKPI(taskData.kpiId)) {
      return false;
    }

    return true;
  }

  /**
   * Save configuration to localStorage
   */
  save() {
    if (!this.config) return;

    this.config.modifiedAt = Date.now();
    localStorage.setItem('kgi_config', JSON.stringify(this.config));
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify listeners of changes
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = null;
    localStorage.removeItem('kgi_config');
    this.createDefaultConfig();
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigManager;
}
