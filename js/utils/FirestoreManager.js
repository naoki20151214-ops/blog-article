/**
 * FirestoreManager - Direct Firestore integration for KGI system
 * Replaces backend API with client-side Firestore access
 */

class FirestoreManager {
  constructor(firebaseConfig) {
    this.db = null;
    this.firebaseConfig = firebaseConfig;
    this.initialized = false;
  }

  /**
   * Initialize Firebase and Firestore
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Firebase...');

      // Initialize Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(this.firebaseConfig);
      }

      this.db = firebase.firestore();

      // Enable offline persistence
      try {
        await this.db.enablePersistence();
        console.log('✅ Offline persistence enabled');
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Multiple tabs open, offline persistence disabled');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ Offline persistence not supported on this browser');
        }
      }

      this.initialized = true;
      console.log('✅ Firestore initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error;
    }
  }

  /**
   * Get all KGIs
   */
  async getAllKGIs() {
    try {
      console.log('🔄 Fetching KGIs from Firestore...');
      const snapshot = await this.db.collection('kgis').get();
      const kgis = [];
      snapshot.forEach(doc => {
        kgis.push({ id: doc.id, ...doc.data() });
      });
      console.log(`✅ Fetched ${kgis.length} KGI(s)`);
      return kgis;
    } catch (error) {
      console.error('❌ Error fetching KGIs:', error);
      throw error;
    }
  }

  /**
   * Get single KGI
   */
  async getKGI(kgiId) {
    try {
      console.log(`🔄 Fetching KGI: ${kgiId}`);
      const doc = await this.db.collection('kgis').doc(kgiId).get();
      if (!doc.exists) {
        console.warn(`⚠️ KGI not found: ${kgiId}`);
        return null;
      }
      console.log(`✅ Fetched KGI: ${kgiId}`);
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`❌ Error fetching KGI ${kgiId}:`, error);
      throw error;
    }
  }

  /**
   * Create new KGI
   */
  async createKGI(kgiData) {
    try {
      console.log('🔄 Creating KGI:', kgiData);

      const newKGI = {
        name: kgiData.name,
        emoji: kgiData.emoji || '🎯',
        description: kgiData.description || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection('kgis').add(newKGI);
      const kgiWithId = { id: docRef.id, ...newKGI };

      console.log(`✅ KGI created: ${docRef.id}`);
      return kgiWithId;
    } catch (error) {
      console.error('❌ Error creating KGI:', error);
      throw error;
    }
  }

  /**
   * Update KGI
   */
  async updateKGI(kgiId, updates) {
    try {
      console.log(`🔄 Updating KGI: ${kgiId}`, updates);

      updates.modifiedAt = firebase.firestore.FieldValue.serverTimestamp();

      await this.db.collection('kgis').doc(kgiId).update(updates);

      console.log(`✅ KGI updated: ${kgiId}`);
      return { id: kgiId, ...updates };
    } catch (error) {
      console.error(`❌ Error updating KGI ${kgiId}:`, error);
      throw error;
    }
  }

  /**
   * Delete KGI
   */
  async deleteKGI(kgiId) {
    try {
      console.log(`🔄 Deleting KGI: ${kgiId}`);

      await this.db.collection('kgis').doc(kgiId).delete();

      console.log(`✅ KGI deleted: ${kgiId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting KGI ${kgiId}:`, error);
      throw error;
    }
  }

  /**
   * Get all KPIs for a KGI
   */
  async getKPIs(kgiId) {
    try {
      console.log(`🔄 Fetching KPIs for KGI: ${kgiId}`);
      const snapshot = await this.db.collection('kpis')
        .where('kgiId', '==', kgiId)
        .get();

      const kpis = [];
      snapshot.forEach(doc => {
        kpis.push({ id: doc.id, ...doc.data() });
      });

      console.log(`✅ Fetched ${kpis.length} KPI(s)`);
      return kpis;
    } catch (error) {
      console.error('❌ Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Create new KPI
   */
  async createKPI(kpiData) {
    try {
      console.log('🔄 Creating KPI:', kpiData);

      const newKPI = {
        kgiId: kpiData.kgiId,
        name: kpiData.name,
        current: kpiData.current || 0,
        target: kpiData.target || 100,
        unit: kpiData.unit || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection('kpis').add(newKPI);

      console.log(`✅ KPI created: ${docRef.id}`);
      return { id: docRef.id, ...newKPI };
    } catch (error) {
      console.error('❌ Error creating KPI:', error);
      throw error;
    }
  }

  /**
   * Update KPI value
   */
  async updateKPIValue(kpiId, value) {
    try {
      console.log(`🔄 Updating KPI value: ${kpiId} = ${value}`);

      await this.db.collection('kpis').doc(kpiId).update({
        current: value,
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ KPI value updated: ${kpiId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating KPI ${kpiId}:`, error);
      throw error;
    }
  }

  /**
   * Get all tasks for a KPI
   */
  async getTasks(kpiId) {
    try {
      console.log(`🔄 Fetching tasks for KPI: ${kpiId}`);
      const snapshot = await this.db.collection('tasks')
        .where('kpiId', '==', kpiId)
        .get();

      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      console.log(`✅ Fetched ${tasks.length} task(s)`);
      return tasks;
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData) {
    try {
      console.log('🔄 Creating task:', taskData);

      const newTask = {
        kpiId: taskData.kpiId,
        title: taskData.title,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection('tasks').add(newTask);

      console.log(`✅ Task created: ${docRef.id}`);
      return { id: docRef.id, ...newTask };
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time KGI updates
   */
  subscribeToKGIs(callback) {
    try {
      console.log('🔄 Subscribing to real-time KGI updates...');

      return this.db.collection('kgis').onSnapshot(
        (snapshot) => {
          const kgis = [];
          snapshot.forEach(doc => {
            kgis.push({ id: doc.id, ...doc.data() });
          });
          console.log(`📡 Real-time update: ${kgis.length} KGI(s)`);
          callback(kgis);
        },
        (error) => {
          console.error('❌ Error in KGI subscription:', error);
        }
      );
    } catch (error) {
      console.error('❌ Error subscribing to KGIs:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time KPI updates
   */
  subscribeToKPIs(kgiId, callback) {
    try {
      console.log(`🔄 Subscribing to real-time KPI updates for KGI: ${kgiId}`);

      return this.db.collection('kpis')
        .where('kgiId', '==', kgiId)
        .onSnapshot(
          (snapshot) => {
            const kpis = [];
            snapshot.forEach(doc => {
              kpis.push({ id: doc.id, ...doc.data() });
            });
            console.log(`📡 Real-time update: ${kpis.length} KPI(s)`);
            callback(kpis);
          },
          (error) => {
            console.error('❌ Error in KPI subscription:', error);
          }
        );
    } catch (error) {
      console.error('❌ Error subscribing to KPIs:', error);
      throw error;
    }
  }
}
