const { getDB } = require('../config/firebase');

const COLLECTION = 'kgis';

// Create a new KGI document
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

// Get a single KGI by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all KGIs
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const kgis = [];
  snapshot.forEach(doc => {
    kgis.push(doc.data());
  });

  return kgis;
};

// Update a KGI
const updateById = async (id, data) => {
  const db = getDB();
  const now = new Date();

  await db.collection(COLLECTION).doc(id).update({
    ...data,
    modifiedAt: now,
  });

  return data;
};

// Delete a KGI
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

module.exports = {
  create,
  findById,
  findAll,
  updateById,
  deleteById,
  COLLECTION,
};
