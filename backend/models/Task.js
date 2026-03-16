const { getDB } = require('../config/firebase');

const COLLECTION = 'tasks';

// Create a new Task document
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

// Get a single Task by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all Tasks
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const tasks = [];
  snapshot.forEach(doc => {
    tasks.push(doc.data());
  });

  return tasks;
};

// Get Tasks by KPI ID
const findByKpiId = async (kpiId) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('kpiId', '==', kpiId)
    .orderBy('order')
    .get();

  const tasks = [];
  snapshot.forEach(doc => {
    tasks.push(doc.data());
  });

  return tasks;
};

// Update a Task
const updateById = async (id, data) => {
  const db = getDB();
  const now = new Date();

  await db.collection(COLLECTION).doc(id).update({
    ...data,
    modifiedAt: now,
  });

  return data;
};

// Delete a Task
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = {
  create,
  findById,
  findAll,
  findByKpiId,
  updateById,
  deleteById,
  COLLECTION,
};
