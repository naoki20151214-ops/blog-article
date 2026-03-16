const { getDB } = require('../config/firebase');

const COLLECTION = 'changeHistory';

// Create a new ChangeHistory document
const create = async (data) => {
  const db = getDB();
  const now = new Date();

  const docRef = await db.collection(COLLECTION).add({
    ...data,
    timestamp: now,
  });

  return {
    id: docRef.id,
    ...data,
    timestamp: now,
  };
};

// Get all ChangeHistory records
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .orderBy('timestamp', 'desc')
    .get();

  const records = [];
  snapshot.forEach(doc => {
    records.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return records;
};

// Get ChangeHistory records by KPI ID
const findByKpiId = async (kpiId) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('kpiId', '==', kpiId)
    .orderBy('timestamp', 'desc')
    .get();

  const records = [];
  snapshot.forEach(doc => {
    records.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return records;
};

// Get ChangeHistory records within a date range
const findByDateRange = async (startDate, endDate) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .orderBy('timestamp', 'desc')
    .get();

  const records = [];
  snapshot.forEach(doc => {
    records.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return records;
};

module.exports = {
  create,
  findAll,
  findByKpiId,
  findByDateRange,
  COLLECTION,
};
