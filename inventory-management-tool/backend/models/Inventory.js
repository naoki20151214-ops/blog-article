const { getDB } = require('../config/firebase');
const { calculateAvailableQuantity } = require('../utils/helpers');

const COLLECTION = 'inventories';

// Create a new Inventory document
const create = async (data) => {
  const db = getDB();
  const docRef = db.collection(COLLECTION).doc(data.id);
  const now = new Date();

  const quantityAvailable = calculateAvailableQuantity(
    data.quantityOnHand,
    data.quantityReserved || 0
  );

  await docRef.set({
    id: data.id,
    productId: data.productId,
    warehouseLocation: data.warehouseLocation,
    quantityOnHand: data.quantityOnHand,
    quantityReserved: data.quantityReserved || 0,
    quantityAvailable: quantityAvailable,
    lastCountedDate: data.lastCountedDate || now,
    reorderQuantity: data.reorderQuantity || 0,
    leadTimeDays: data.leadTimeDays || 0,
    createdAt: now,
    modifiedAt: now,
  });

  return data;
};

// Get a single Inventory by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all Inventory records
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const inventories = [];
  snapshot.forEach(doc => {
    inventories.push(doc.data());
  });

  return inventories;
};

// Get inventory by product ID
const findByProductId = async (productId) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('productId', '==', productId)
    .get();

  const inventories = [];
  snapshot.forEach(doc => {
    inventories.push(doc.data());
  });

  return inventories;
};

// Get low stock inventory items
const findLowStock = async (reorderLevel) => {
  const db = getDB();
  const allInventories = await findAll();

  return allInventories.filter(inv => inv.quantityAvailable <= reorderLevel);
};

// Update inventory quantity
const updateQuantity = async (id, quantityOnHand, quantityReserved = null) => {
  const db = getDB();
  const now = new Date();

  const currentInventory = await findById(id);
  if (!currentInventory) {
    throw new Error('Inventory not found');
  }

  const reserved = quantityReserved !== null ? quantityReserved : currentInventory.quantityReserved;
  const available = calculateAvailableQuantity(quantityOnHand, reserved);

  const updateData = {
    quantityOnHand,
    quantityReserved: reserved,
    quantityAvailable: available,
    modifiedAt: now,
  };

  await db.collection(COLLECTION).doc(id).update(updateData);

  return updateData;
};

// Adjust inventory (add or subtract)
const adjustQuantity = async (id, quantity) => {
  const db = getDB();
  const inventory = await findById(id);

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const newQuantity = inventory.quantityOnHand + quantity;

  if (newQuantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  return updateQuantity(id, newQuantity);
};

// Record inventory count (棚卸)
const recordCount = async (id, countedQuantity) => {
  const db = getDB();
  const inventory = await findById(id);

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const now = new Date();

  const updateData = {
    quantityOnHand: countedQuantity,
    quantityAvailable: calculateAvailableQuantity(countedQuantity, inventory.quantityReserved),
    lastCountedDate: now,
    modifiedAt: now,
  };

  await db.collection(COLLECTION).doc(id).update(updateData);

  return updateData;
};

// Update inventory record
const updateById = async (id, data) => {
  const db = getDB();
  const now = new Date();

  const updateData = {
    ...data,
    modifiedAt: now,
  };

  if (data.quantityOnHand !== undefined && data.quantityReserved !== undefined) {
    updateData.quantityAvailable = calculateAvailableQuantity(
      data.quantityOnHand,
      data.quantityReserved
    );
  }

  await db.collection(COLLECTION).doc(id).update(updateData);

  return updateData;
};

// Delete inventory record
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

// Check if inventory exists
const exists = async (id) => {
  const inventory = await findById(id);
  return inventory !== null;
};

module.exports = {
  create,
  findById,
  findAll,
  findByProductId,
  findLowStock,
  updateQuantity,
  adjustQuantity,
  recordCount,
  updateById,
  deleteById,
  exists,
  COLLECTION,
};
