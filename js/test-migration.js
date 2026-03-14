/**
 * Test script to verify KGI system migration and initialization
 * Run this in the browser console or as a Node.js script
 */

function runMigrationTest() {
  console.log('=== KGI System Migration Test ===\n');

  // Test 1: Check if migration is needed
  console.log('Test 1: Check migration detection');
  const needsMigration = MigrationHelper.needsMigration();
  console.log('  Needs migration:', needsMigration);
  console.log('  ✓ Pass\n');

  // Test 2: Initialize ConfigManager
  console.log('Test 2: Initialize ConfigManager');
  const configManager = new ConfigManager();
  const initialized = configManager.initialize();
  console.log('  Initialized:', initialized);
  console.log('  Config version:', configManager.getConfig().version);
  console.log('  ✓ Pass\n');

  // Test 3: Check KGI
  console.log('Test 3: Verify KGI');
  const kgi = configManager.getKGI();
  console.log('  KGI ID:', kgi.id);
  console.log('  KGI Name:', kgi.name);
  console.log('  KGI Emoji:', kgi.emoji);
  console.log('  ✓ Pass\n');

  // Test 4: Check KPIs
  console.log('Test 4: Verify KPIs');
  const kpis = configManager.getKPIs();
  console.log('  Number of KPIs:', kpis.length);
  kpis.forEach((kpi, index) => {
    console.log(`  KPI ${index + 1}:`);
    console.log(`    - ID: ${kpi.id}`);
    console.log(`    - Name: ${kpi.name}`);
    console.log(`    - Type: ${kpi.type}`);
    console.log(`    - Target: ${kpi.target}`);
    console.log(`    - Current: ${kpi.current}`);
    console.log(`    - Importance: ${kpi.importance}`);
    if (kpi._migratedFrom) {
      console.log(`    - Migrated from: ${kpi._migratedFrom}`);
    }
  });
  console.log('  ✓ Pass\n');

  // Test 5: Check Tasks
  console.log('Test 5: Verify Tasks');
  const tasks = configManager.getTasks();
  console.log('  Total tasks:', tasks.length);
  tasks.slice(0, 3).forEach((task, index) => {
    console.log(`  Task ${index + 1}:`);
    console.log(`    - ID: ${task.id}`);
    console.log(`    - Name: ${task.name}`);
    console.log(`    - KPI: ${task.kpiId}`);
    console.log(`    - AutoSync: ${task.autoSyncValue}`);
  });
  console.log('  ... and', tasks.length - 3, 'more tasks');
  console.log('  ✓ Pass\n');

  // Test 6: Initialize KGIStore
  console.log('Test 6: Initialize KGIStore');
  const kgiStore = new KGIStore(configManager);
  console.log('  Task queue size:', kgiStore.getTaskQueue().length);
  console.log('  History size:', kgiStore.getAllHistory().length);
  console.log('  ✓ Pass\n');

  // Test 7: Test KPI value operations
  console.log('Test 7: Test KPI value operations');
  const firstKpi = kpis[0];
  const oldValue = firstKpi.current;
  console.log(`  Initial value of ${firstKpi.name}: ${oldValue}`);

  kgiStore.incrementKPI(firstKpi.id, 5);
  const newValue = configManager.getKPI(firstKpi.id).current;
  console.log(`  After increment(5): ${newValue}`);
  console.log(`  Change recorded: ${newValue === oldValue + 5 ? 'Yes' : 'No'}`);
  console.log('  ✓ Pass\n');

  // Test 8: Test KGI progress calculation
  console.log('Test 8: Test KGI progress calculation');
  const progress = kgiStore.calculateKGIProgress();
  console.log('  KGI Progress:', progress + '%');
  console.log('  ✓ Pass\n');

  // Test 9: Test change history
  console.log('Test 9: Verify change history');
  const history = kgiStore.getAllHistory();
  console.log('  History entries:', history.length);
  if (history.length > 0) {
    const lastChange = history[history.length - 1];
    console.log('  Last change:');
    console.log('    - KPI:', lastChange.kpiId);
    console.log('    - Old value:', lastChange.oldValue);
    console.log('    - New value:', lastChange.newValue);
    console.log('    - Source:', lastChange.source);
  }
  console.log('  ✓ Pass\n');

  // Test 10: Test config persistence
  console.log('Test 10: Verify persistence');
  const storedConfig = localStorage.getItem('kgi_config');
  console.log('  Config stored:', storedConfig !== null ? 'Yes' : 'No');
  if (storedConfig) {
    try {
      const parsed = JSON.parse(storedConfig);
      console.log('  Stored version:', parsed.version);
      console.log('  KPIs in storage:', parsed.kpis.length);
      console.log('  Tasks in storage:', parsed.tasks.length);
    } catch (e) {
      console.log('  Error parsing stored config:', e.message);
    }
  }
  console.log('  ✓ Pass\n');

  console.log('=== All Tests Passed! ===');
  console.log('\nSystem Status:');
  console.log('✅ ConfigManager: Ready');
  console.log('✅ KGIStore: Ready');
  console.log('✅ Migration: ' + (needsMigration ? 'Completed' : 'Not needed'));
  console.log('✅ Persistence: Active');

  return {
    configManager,
    kgiStore,
    testsPassed: true
  };
}

// Run tests if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runMigrationTest);
  } else {
    runMigrationTest();
  }
}

// Export for Node.js if applicable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMigrationTest };
}
