const { getDB } = require('../config/firebase');

const COLLECTION = 'kpis';

// Create a new KPI document
const create = async (data) => {
  const db = getDB();
  const docRef = db.collection(COLLECTION).doc(data.id);
  const now = new Date();

  await docRef.set({
    ...data,
    createdAt: now,
    modifiedAt: now,
  });

  return data;
};

// Get a single KPI by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all KPIs
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const kpis = [];
  snapshot.forEach(doc => {
    kpis.push(doc.data());
  });

  return kpis;
};

// Get KPIs by KGI ID
const findByKgiId = async (kgiId) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('kgiId', '==', kgiId)
    .get();

  const kpis = [];
  snapshot.forEach(doc => {
    kpis.push(doc.data());
  });

  return kpis;
};

// Update a KPI
const updateById = async (id, data) => {
  const db = getDB();
  const now = new Date();

  await db.collection(COLLECTION).doc(id).update({
    ...data,
    modifiedAt: now,
  });

  return data;
};

// Delete a KPI
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = {
  create,
  findById,
  findAll,
  findByKgiId,
  updateById,
  deleteById,
  COLLECTION,
};
