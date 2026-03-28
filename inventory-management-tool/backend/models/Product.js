const { getDB } = require('../config/firebase');

const COLLECTION = 'products';

// Create a new Product document
const create = async (data) => {
  const db = getDB();
  const docRef = db.collection(COLLECTION).doc(data.id);
  const now = new Date();

  await docRef.set({
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description || '',
    category: data.category,
    unit: data.unit || '個',
    unitPrice: data.unitPrice,
    supplierId: data.supplierId,
    reorderLevel: data.reorderLevel,
    maxStock: data.maxStock,
    status: data.status || 'active',
    createdAt: now,
    modifiedAt: now,
    notes: data.notes || '',
  });

  return data;
};

// Get a single Product by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all Products
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const products = [];
  snapshot.forEach(doc => {
    products.push(doc.data());
  });

  return products;
};

// Get Products by category
const findByCategory = async (category) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('category', '==', category)
    .get();

  const products = [];
  snapshot.forEach(doc => {
    products.push(doc.data());
  });

  return products;
};

// Get Products by supplier
const findBySupplier = async (supplierId) => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('supplierId', '==', supplierId)
    .get();

  const products = [];
  snapshot.forEach(doc => {
    products.push(doc.data());
  });

  return products;
};

// Search products by name or code
const search = async (query) => {
  const db = getDB();
  const allProducts = await findAll();

  return allProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.code.toLowerCase().includes(query.toLowerCase())
  );
};

// Update a Product
const updateById = async (id, data) => {
  const db = getDB();
  const now = new Date();

  const updateData = {
    ...data,
    modifiedAt: now,
  };

  await db.collection(COLLECTION).doc(id).update(updateData);

  return updateData;
};

// Delete a Product
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

// Check if product exists
const exists = async (id) => {
  const product = await findById(id);
  return product !== null;
};

module.exports = {
  create,
  findById,
  findAll,
  findByCategory,
  findBySupplier,
  search,
  updateById,
  deleteById,
  exists,
  COLLECTION,
};
