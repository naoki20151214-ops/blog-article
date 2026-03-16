/**
 * ConfigManager - Manages KGI system configuration
 * Handles loading, saving, and validating configuration
 * Now integrated with backend API instead of localStorage
 */

class ConfigManager {
  constructor(apiUrl = '') {
    this.config = null;
    this.listeners = [];
    this.apiUrl = apiUrl;
    this.isLoading = false;
  }

  /**
   * Initialize configuration from API or use defaults
   */
  async initialize() {
    if (this.isLoading) return true;
    this.isLoading = true;

    try {
      // Try to load existing config from API
      console.log('🔄 Attempting to load configuration from Firestore API...');
      const kgis = await this._apiFetch('/api/kgi', 'GET');

      if (kgis && kgis.length > 0) {
        await this._buildConfigFromAPI(kgis);
        console.log(`✅ Successfully loaded ${kgis.length} KGI(s) from Firestore API`);
        console.log('KGI data:', kgis);
        this.isLoading = false;
        return true;
      }

      // No data in API - create default
      console.log('ℹ️ No KGI data found in Firestore API, creating default configuration');
      this.createDefaultConfig();
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error('❌ Firestore API Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });

      // Fallback: try localStorage as backup
      console.log('🔄 Attempting fallback: Loading from localStorage...');
      const stored = localStorage.getItem('kgi_config');
      if (stored) {
        try {
          this.config = JSON.parse(stored);
          console.log('✅ Loaded configuration from localStorage (API unavailable)');
          console.log('Loaded from localStorage:', this.config);
          this.isLoading = false;
          return true;
        } catch (e) {
          console.error('Error parsing localStorage JSON:', e);
        }
      }
      // Last resort: create default
      console.log('⚠️ No localStorage backup found, creating default configuration');
      this.createDefaultConfig();
      this.isLoading = false;
      return true;
    }
  }

  /**
   * Build config object from API data
   */
  async _buildConfigFromAPI(kgis) {
    // Initialize config structure
    this.config = {
      version: 2,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      kgis: kgis,
      currentKgiId: kgis[0]?.id || null,
      kpis: [],
      tasks: []
    };

    // Fetch KPIs for each KGI
    for (const kgi of kgis) {
      try {
        const kpis = await this._apiFetch(`/api/kgi/${kgi.id}/kpi`, 'GET');
        this.config.kpis.push(...kpis);

        // Fetch tasks for each KPI
        for (const kpi of kpis) {
          try {
            const tasks = await this._apiFetch(`/api/kpi/${kpi.id}/task`, 'GET');
            this.config.tasks.push(...tasks);
          } catch (e) {
            console.error(`Error fetching tasks for KPI ${kpi.id}:`, e);
          }
        }
      } catch (e) {
        console.error(`Error fetching KPIs for KGI ${kgi.id}:`, e);
      }
    }
  }

  /**
   * Create default configuration
   */
  createDefaultConfig() {
    const defaultKgiId = 'kgi_' + Date.now();

    this.config = {
      version: 2,
      createdAt: Date.now(),
      modifiedAt: Date.now(),

      // Multiple KGI support
      kgis: [
        {
          id: defaultKgiId,
          name: '来週のテストで100点を取る',
          emoji: '🎯',
          description: 'Test score target',
          createdAt: Date.now(),
          modifiedAt: Date.now()
        }
      ],
      currentKgiId: defaultKgiId,

      kpis: [
        {
          id: 'kpi_1',
          kgiId: defaultKgiId,
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
          kgiId: defaultKgiId,
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
          kgiId: defaultKgiId,
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
    const kgis = config.kgis || [];

    if (kgiId) {
      return kgis.find(kgi => kgi.id === kgiId) || null;
    }

    // Return current KGI if no ID specified
    if (config.currentKgiId) {
      return kgis.find(kgi => kgi.id === config.currentKgiId) || null;
    }

    // Fallback to first KGI
    return kgis.length > 0 ? kgis[0] : null;
  }

  /**
   * Get all KGIs
   */
  getKGIs() {
    return this.getConfig().kgis || [];
  }

  /**
   * Get current KGI ID
   */
  getCurrentKgiId() {
    return this.getConfig().currentKgiId;
  }

  /**
   * Get current KGI
   */
  getCurrentKGI() {
    return this.getKGI();
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
   * Add new KPI (async - sends to API)
   */
  async addKPI(kpiData) {
    if (!this.validateKPI(kpiData)) {
      throw new Error('Invalid KPI data');
    }

    const config = this.getConfig();
    const kgiId = kpiData.kgiId || config.currentKgiId;

    const newKPI = {
      id: 'kpi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      kgiId: kgiId,
      name: kpiData.name,
      emoji: kpiData.emoji || '📊',
      type: kpiData.type || 'manual',
      target: kpiData.target || 100,
      current: kpiData.current || 0,
      unit: kpiData.unit || '',
      importance: kpiData.importance || 'B',
      order: config.kpis.filter(k => k.kgiId === kgiId).length,
      subtaskSyncType: 'auto',
      subtaskChunkSize: kpiData.subtaskChunkSize || 1,
    };

    try {
      const savedKPI = await this._apiFetch('/api/kpi', 'POST', newKPI);
      config.kpis.push(savedKPI);
      this.save();
      this.notifyListeners('kpi_added', savedKPI);
      return savedKPI;
    } catch (error) {
      console.error('Error adding KPI:', error);
      throw error;
    }
  }

  /**
   * Update KPI (async - sends to API)
   */
  async updateKPI(kpiId, updates) {
    const kpi = this.getKPI(kpiId);
    if (!kpi) {
      throw new Error('KPI not found: ' + kpiId);
    }

    try {
      const updated = await this._apiFetch(`/api/kpi/${kpiId}`, 'PUT', updates);
      Object.assign(kpi, updated);
      this.save();
      this.notifyListeners('kpi_updated', kpi);
      return kpi;
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw error;
    }
  }

  /**
   * Delete KPI (async - sends to API)
   */
  async deleteKPI(kpiId) {
    const config = this.getConfig();
    const index = config.kpis.findIndex(kpi => kpi.id === kpiId);

    if (index === -1) {
      throw new Error('KPI not found: ' + kpiId);
    }

    try {
      await this._apiFetch(`/api/kpi/${kpiId}`, 'DELETE');
      // Also delete tasks for this KPI locally
      config.tasks = config.tasks.filter(task => task.kpiId !== kpiId);
      config.kpis.splice(index, 1);
      this.save();
      this.notifyListeners('kpi_deleted', kpiId);
    } catch (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  }

  /**
   * Add new task (async - sends to API)
   */
  async addTask(taskData) {
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
    };

    try {
      const savedTask = await this._apiFetch('/api/task', 'POST', newTask);
      this.getConfig().tasks.push(savedTask);
      this.save();
      this.notifyListeners('task_added', savedTask);
      return savedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  /**
   * Update task (async - sends to API)
   */
  async updateTask(taskId, updates) {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error('Task not found: ' + taskId);
    }

    try {
      const updated = await this._apiFetch(`/api/task/${taskId}`, 'PUT', updates);
      Object.assign(task, updated);
      this.save();
      this.notifyListeners('task_updated', task);
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete task (async - sends to API)
   */
  async deleteTask(taskId) {
    const config = this.getConfig();
    const index = config.tasks.findIndex(task => task.id === taskId);

    if (index === -1) {
      throw new Error('Task not found: ' + taskId);
    }

    try {
      await this._apiFetch(`/api/task/${taskId}`, 'DELETE');
      config.tasks.splice(index, 1);
      this.save();
      this.notifyListeners('task_deleted', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Update KGI (async - sends to API)
   */
  async updateKGI(kgiId, updates) {
    const config = this.getConfig();
    let kgi;

    // Support both old API (single arg) and new API (kgiId, updates)
    if (typeof kgiId === 'object' && updates === undefined) {
      // Old API: updateKGI(updates) - update current KGI
      updates = kgiId;
      kgi = this.getCurrentKGI();
      kgiId = kgi.id;
    } else {
      // New API: updateKGI(kgiId, updates) - update specific KGI
      kgi = config.kgis.find(k => k.id === kgiId);
    }

    if (!kgi) {
      throw new Error('KGI not found');
    }

    try {
      const updated = await this._apiFetch(`/api/kgi/${kgiId}`, 'PUT', updates);
      Object.assign(kgi, updated);
      this.save();
      this.notifyListeners('kgi_updated', kgi);
      return kgi;
    } catch (error) {
      console.error('Error updating KGI:', error);
      throw error;
    }
  }

  /**
   * Add new KGI (async - sends to API)
   */
  /**
   * KGI を作成・保存する（Firestore 直接接続版）
   * @param {Object} kgiData - {name, emoji, description}
   * @returns {Object} 保存後の KGI オブジェクト（Firestore ID を含む）
   */
  async addKGI(kgiData) {
    // 入力値の検証
    if (!this.validateKGI(kgiData)) {
      throw new Error('Invalid KGI data');
    }

    try {
      // 1️⃣ FirebaseManager を初期化（既に初期化済みの場合はスキップ）
      await FirebaseManager.ensureInitialized();

      console.log('📡 Firestore に KGI を保存中...');

      // 2️⃣ FirebaseManager.saveKGI() を呼び出して Firestore に保存
      const newKGI = await FirebaseManager.saveKGI({
        name: kgiData.name,
        emoji: kgiData.emoji || '🎯',
        description: kgiData.description || ''
      });

      console.log('✅ Firestore 保存完了, ローカル config を更新中...');

      // 3️⃣ ローカル設定オブジェクトにも追加（フォールバック用）
      const config = this.getConfig();
      config.kgis.push(newKGI);

      // 4️⃣ 新しい KGI を現在の KGI に設定
      config.currentKgiId = newKGI.id;

      // 5️⃣ localStorage にもバックアップ保存
      this.save();

      console.log('✅ KGI 作成完了（ローカルとクラウドの両方に保存）');
      this.notifyListeners('kgi_added', newKGI);

      return newKGI;

    } catch (error) {
      console.error('❌ KGI 作成失敗（Firestore）:', error);

      // Firestore へのアクセスに失敗した場合、localStorage のみで処理
      if (error.message.includes('Network') || error.message.includes('Permission')) {
        console.warn('⚠️ Firestore にアクセスできないため、localStorage のみで保存します');

        // ローカルのみで作成
        const localKGI = {
          id: 'kgi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: kgiData.name,
          emoji: kgiData.emoji || '🎯',
          description: kgiData.description || '',
          createdAt: Date.now(),
          modifiedAt: Date.now()
        };

        const config = this.getConfig();
        config.kgis.push(localKGI);
        config.currentKgiId = localKGI.id;
        this.save();

        console.warn('⚠️ KGI がローカルのみで作成されています（Firestore 同期待機中）');
        this.notifyListeners('kgi_added', localKGI);

        return localKGI;
      }

      // その他のエラーはそのまま上位に処理
      throw error;
    }
  }

  /**
   * Delete KGI and its associated KPIs and tasks (async - sends to API)
   */
  async deleteKGI(kgiId) {
    const config = this.getConfig();
    const index = config.kgis.findIndex(kgi => kgi.id === kgiId);

    if (index === -1) {
      throw new Error('KGI not found: ' + kgiId);
    }

    try {
      await this._apiFetch(`/api/kgi/${kgiId}`, 'DELETE');

      // Delete associated KPIs and tasks locally
      const kpisToDelete = config.kpis.filter(kpi => kpi.kgiId === kgiId);
      kpisToDelete.forEach(kpi => {
        config.tasks = config.tasks.filter(task => task.kpiId !== kpi.id);
      });
      config.kpis = config.kpis.filter(kpi => kpi.kgiId !== kgiId);

      // Remove KGI
      config.kgis.splice(index, 1);

      // Update currentKgiId if needed
      if (config.currentKgiId === kgiId) {
        config.currentKgiId = config.kgis.length > 0 ? config.kgis[0].id : null;
      }

      this.save();
      this.notifyListeners('kgi_deleted', kgiId);
    } catch (error) {
      console.error('Error deleting KGI:', error);
      throw error;
    }
  }

  /**
   * Select a KGI as current
   */
  selectKGI(kgiId) {
    const kgi = this.getKGI(kgiId);
    if (!kgi) {
      throw new Error('KGI not found: ' + kgiId);
    }

    this.getConfig().currentKgiId = kgiId;
    this.save();
    this.notifyListeners('kgi_selected', kgiId);
  }

  /**
   * Validate KGI data
   */
  validateKGI(kgiData) {
    if (!kgiData.name || typeof kgiData.name !== 'string' || kgiData.name.trim() === '') {
      return false;
    }

    if (kgiData.emoji && typeof kgiData.emoji !== 'string') {
      return false;
    }

    return true;
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
   * Save configuration to localStorage (fallback)
   */
  save() {
    if (!this.config) return;

    this.config.modifiedAt = Date.now();
    // Keep localStorage as fallback only
    localStorage.setItem('kgi_config', JSON.stringify(this.config));
  }

  /**
   * API helper method for fetch requests
   */
  async _apiFetch(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for CORS requests (Safari compatibility)
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      console.log(`🔄 API Request: ${method} ${endpoint}`);
      const response = await fetch(this.apiUrl + endpoint, options);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${method} ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
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
