const { getDB } = require('../config/firebase');
const { generateId } = require('../utils/helpers');

const COLLECTION = 'inventoryHistory';

// Create a new History record
const create = async (data) => {
  const db = getDB();
  const id = generateId();
  const now = new Date();

  const historyRecord = {
    id,
    productId: data.productId,
    inventoryId: data.inventoryId,
    transactionType: data.transactionType,
    quantity: data.quantity,
    previousQuantity: data.previousQuantity,
    newQuantity: data.newQuantity,
    reason: data.reason,
    reference: data.reference || '',
    notes: data.notes || '',
    createdBy: data.createdBy || 'system',
    timestamp: now,
    createdAt: now,
  };

  await db.collection(COLLECTION).doc(id).set(historyRecord);

  return historyRecord;
};

// Get a single history record by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all history records (with pagination)
const findAll = async (limit = 50, offset = 0) => {
  const db = getDB();
  let query = db.collection(COLLECTION).orderBy('timestamp', 'desc');

  // Get total count
  const totalSnapshot = await db.collection(COLLECTION).get();
  const total = totalSnapshot.size;

  // Apply pagination
  query = query.offset(offset).limit(limit);
  const snapshot = await query.get();

  const records = [];
  snapshot.forEach(doc => {
    records.push(doc.data());
  });

  return {
    records,
    total,
    limit,
    offset,
  };
};

// Get history by product ID
const findByProductId = async (productId, limit = 50, offset = 0) => {
  const db = getDB();

  // Get total count
  const totalSnapshot = await db.collection(COLLECTION)
    .where('productId', '==', productId)
    .get();
  const total = totalSnapshot.size;

  // Get paginated results
  let query = db.collection(COLLECTION)
    .where('productId', '==', productId)
    .orderBy('timestamp', 'desc');

  query = query.offset(offset).limit(limit);
  const snapshot = await query.get();

  const records = [];
  snapshot.forEach(doc => {
    records.push(doc.data());
  });

  return {
    records,
    total,
    limit,
    offset,
  };
};

// Get history by inventory ID
const findByInventoryId = async (inventoryId, limit = 50, offset = 0) => {
  const db = getDB();

  // Get total count
  const totalSnapshot = await db.collection(COLLECTION)
    .where('inventoryId', '==', inventoryId)
    .get();
  const total = totalSnapshot.size;

  // Get paginated results
  let query = db.collection(COLLECTION)
    .where('inventoryId', '==', inventoryId)
    .orderBy('timestamp', 'desc');

  query = query.offset(offset).limit(limit);
  const snapshot = await query.get();

  const records = [];
  snapshot.forEach(doc => {
    records.push(doc.data());
  });

  return {
    records,
    total,
    limit,
    offset,
  };
};

// Get history by date range
const findByDateRange = async (startDate, endDate, limit = 50, offset = 0) => {
  const db = getDB();

  // Get total count
  const totalSnapshot = await db.collection(COLLECTION)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .get();
  const total = totalSnapshot.size;

  // Get paginated results
  let query = db.collection(COLLECTION)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .orderBy('timestamp', 'desc');

  query = query.offset(offset).limit(limit);
  const snapshot = await query.get();

  const records = [];
  snapshot.forEach(doc => {
    records.push(doc.data());
  });

  return {
    records,
    total,
    limit,
    offset,
  };
};

// Delete old history records (cleanup)
const deleteOlderThan = async (days) => {
  const db = getDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const snapshot = await db.collection(COLLECTION)
    .where('timestamp', '<', cutoffDate)
    .get();

  let count = 0;
  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  return count;
};

module.exports = {
  create,
  findById,
  findAll,
  findByProductId,
  findByInventoryId,
  findByDateRange,
  deleteOlderThan,
  COLLECTION,
};
