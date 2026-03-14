/**
 * MigrationHelper - Handles backward compatibility and data migration
 * Automatically detects old data format and migrates to new generalized structure
 */

class MigrationHelper {
  /**
   * Check if data needs migration from old format to new format
   */
  static needsMigration() {
    const hasNewConfig = localStorage.getItem('kgi_config') !== null;
    const hasOldData = localStorage.getItem('kgi_vocab') !== null;
    return !hasNewConfig && hasOldData;
  }

  /**
   * Detect old data format version
   */
  static detectOldDataVersion() {
    // Check for old hardcoded KPIs
    const hasVocab = localStorage.getItem('kgi_vocab') !== null;
    const hasGrammar = localStorage.getItem('kgi_grammar') !== null;
    const hasPractice = localStorage.getItem('kgi_practice') !== null;

    if (hasVocab || hasGrammar || hasPractice) {
      return 1; // Old format version
    }
    return null; // No old data found
  }

  /**
   * Migrate from old format (v1) to new format (v2)
   */
  static migrateFromV1() {
    console.log('🔄 Migrating data from v1 to v2...');

    // Create new configuration structure
    const newConfig = {
      version: 2,
      migratedAt: Date.now(),
      migratedFromVersion: 1,

      // Create default KGI
      kgi: {
        id: 'kgi_' + Date.now(),
        name: '来週のテストで100点を取る',
        emoji: '🎯',
        description: 'Test score target',
        createdAt: Date.now(),
        modifiedAt: Date.now()
      },

      // Migrate old KPIs
      kpis: this._migrateOldKPIs(),

      // Migrate old tasks/subtasks
      tasks: this._migrateOldTasks()
    };

    // Save new configuration
    localStorage.setItem('kgi_config', JSON.stringify(newConfig));
    localStorage.setItem('kgi_config_version', '2');

    console.log('✅ Migration complete!');
    console.log('New configuration:', newConfig);

    return newConfig;
  }

  /**
   * Migrate old KPIs to new structure
   */
  static _migrateOldKPIs() {
    const kpis = [];
    const oldKPIDefinitions = [
      {
        oldId: 'vocab',
        name: '📚 英単語',
        emoji: '📚',
        target: 100,
        unit: '個',
        subtaskChunkSize: 10
      },
      {
        oldId: 'grammar',
        name: '📖 英文法',
        emoji: '📖',
        target: 50,
        unit: 'ページ',
        subtaskChunkSize: 10
      },
      {
        oldId: 'practice',
        name: '✏️ 過去問',
        emoji: '✏️',
        target: 3,
        unit: '回',
        subtaskChunkSize: 1
      }
    ];

    oldKPIDefinitions.forEach((def, index) => {
      const currentValue = parseInt(localStorage.getItem('kgi_' + def.oldId) || '0');
      const importance = localStorage.getItem('kgi_importance_' + def.oldId) || 'B';

      const kpi = {
        id: 'kpi_' + (index + 1),
        kgiId: 'kgi_' + Date.now(), // Will be set by caller
        name: def.name,
        emoji: def.emoji,
        type: 'manual', // Default to manual for migrated data
        target: def.target,
        current: currentValue,
        unit: def.unit,
        importance: importance,
        storageKey: 'kgi_' + def.oldId,
        importanceKey: 'kgi_importance_' + def.oldId,
        order: index,
        subtaskSyncType: 'auto',
        subtaskChunkSize: def.subtaskChunkSize,
        createdAt: Date.now() - (3 - index) * 86400000, // Stagger creation times
        modifiedAt: Date.now(),
        _migratedFrom: def.oldId
      };

      kpis.push(kpi);
    });

    return kpis;
  }

  /**
   * Migrate old tasks/subtasks to new structure
   */
  static _migrateOldTasks() {
    const tasks = [];
    let taskId = 1;

    const kpiMappings = [
      { oldId: 'vocab', newKpiId: 'kpi_1' },
      { oldId: 'grammar', newKpiId: 'kpi_2' },
      { oldId: 'practice', newKpiId: 'kpi_3' }
    ];

    kpiMappings.forEach(mapping => {
      const storageKey = 'kgi_' + mapping.oldId + '_subtasks';
      const subtasksJson = localStorage.getItem(storageKey);

      if (subtasksJson) {
        try {
          const oldSubtasks = JSON.parse(subtasksJson);

          // Determine auto-sync value based on KPI type
          let autoSyncValue = 10; // Default for vocab/grammar
          if (mapping.oldId === 'practice') {
            autoSyncValue = 1;
          }

          oldSubtasks.forEach((oldTask, index) => {
            const task = {
              id: 'task_' + (taskId++),
              kpiId: mapping.newKpiId,
              name: oldTask.name,
              description: '',
              completed: oldTask.completed || false,
              order: index,
              autoSyncValue: autoSyncValue,
              tags: [mapping.oldId],
              createdAt: Date.now() - 86400000,
              modifiedAt: Date.now(),
              _migratedFrom: mapping.oldId
            };
            tasks.push(task);
          });
        } catch (error) {
          console.error('Error migrating subtasks for ' + mapping.oldId, error);
        }
      }
    });

    return tasks;
  }

  /**
   * Validate migrated data
   */
  static validateMigratedData(config) {
    const errors = [];

    // Check KGI
    if (!config.kgi || !config.kgi.id || !config.kgi.name) {
      errors.push('Invalid KGI structure');
    }

    // Check KPIs
    if (!Array.isArray(config.kpis) || config.kpis.length === 0) {
      errors.push('No KPIs found in migrated data');
    }

    // Check tasks
    if (!Array.isArray(config.tasks)) {
      errors.push('Invalid tasks structure');
    }

    // Validate KPI references
    config.kpis.forEach(kpi => {
      if (!kpi.id || !kpi.name || typeof kpi.target !== 'number') {
        errors.push('Invalid KPI: ' + (kpi.name || 'unknown'));
      }

      if (!['manual', 'inventory', 'formula'].includes(kpi.type)) {
        errors.push('Invalid KPI type: ' + kpi.type);
      }

      if (!['A', 'B', 'C'].includes(kpi.importance)) {
        errors.push('Invalid importance level: ' + kpi.importance);
      }
    });

    // Validate task references
    config.tasks.forEach(task => {
      if (!task.id || !task.name || !task.kpiId) {
        errors.push('Invalid task: ' + (task.name || 'unknown'));
      }

      const kpiExists = config.kpis.some(kpi => kpi.id === task.kpiId);
      if (!kpiExists) {
        errors.push('Task references non-existent KPI: ' + task.kpiId);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Perform automatic migration if needed
   */
  static performAutoMigration() {
    if (!this.needsMigration()) {
      console.log('✅ No migration needed');
      return false;
    }

    const oldVersion = this.detectOldDataVersion();
    console.log('🔍 Detected old data format version:', oldVersion);

    if (oldVersion === 1) {
      try {
        const config = this.migrateFromV1();
        const validation = this.validateMigratedData(config);

        if (!validation.valid) {
          console.error('❌ Migration validation failed:', validation.errors);
          return false;
        }

        console.log('✅ Auto-migration successful');
        return true;
      } catch (error) {
        console.error('❌ Migration failed:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Restore from backup (optional)
   */
  static createBackup() {
    const backup = {
      timestamp: Date.now(),
      data: {
        // Old data
        vocab: localStorage.getItem('kgi_vocab'),
        grammar: localStorage.getItem('kgi_grammar'),
        practice: localStorage.getItem('kgi_practice'),
        vocab_tasks: localStorage.getItem('kgi_vocab_subtasks'),
        grammar_tasks: localStorage.getItem('kgi_grammar_subtasks'),
        practice_tasks: localStorage.getItem('kgi_practice_subtasks'),
        task_queue: localStorage.getItem('kgi_task_queue'),
        history: localStorage.getItem('kgi_history'),
        // Importance levels
        importance_vocab: localStorage.getItem('kgi_importance_vocab'),
        importance_grammar: localStorage.getItem('kgi_importance_grammar'),
        importance_practice: localStorage.getItem('kgi_importance_practice')
      }
    };

    localStorage.setItem('kgi_backup_' + backup.timestamp, JSON.stringify(backup));
    return backup;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MigrationHelper;
}
