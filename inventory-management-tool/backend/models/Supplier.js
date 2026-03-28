const { getDB } = require('../config/firebase');

const COLLECTION = 'suppliers';

// Create a new Supplier document
const create = async (data) => {
  const db = getDB();
  const docRef = db.collection(COLLECTION).doc(data.id);
  const now = new Date();

  await docRef.set({
    id: data.id,
    code: data.code,
    name: data.name,
    contactPerson: data.contactPerson || '',
    email: data.email,
    phone: data.phone || '',
    address: data.address || '',
    paymentTerms: data.paymentTerms || 'Net 30',
    status: data.status || 'active',
    rating: data.rating || 0,
    createdAt: now,
    modifiedAt: now,
  });

  return data;
};

// Get a single Supplier by ID
const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

// Get all Suppliers
const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION).get();

  const suppliers = [];
  snapshot.forEach(doc => {
    suppliers.push(doc.data());
  });

  return suppliers;
};

// Get active suppliers
const findActive = async () => {
  const db = getDB();
  const snapshot = await db.collection(COLLECTION)
    .where('status', '==', 'active')
    .get();

  const suppliers = [];
  snapshot.forEach(doc => {
    suppliers.push(doc.data());
  });

  return suppliers;
};

// Search suppliers by name or code
const search = async (query) => {
  const db = getDB();
  const allSuppliers = await findAll();

  return allSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(query.toLowerCase()) ||
    supplier.code.toLowerCase().includes(query.toLowerCase())
  );
};

// Update a Supplier
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

// Delete a Supplier
const deleteById = async (id) => {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
};

// Check if supplier exists
const exists = async (id) => {
  const supplier = await findById(id);
  return supplier !== null;
};

module.exports = {
  create,
  findById,
  findAll,
  findActive,
  search,
  updateById,
  deleteById,
  exists,
  COLLECTION,
};
