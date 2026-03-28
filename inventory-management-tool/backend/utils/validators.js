// Product Validators
const validateProduct = (data) => {
  const errors = [];

  if (!data.id) errors.push('Product ID is required');
  if (!data.code) errors.push('Product code is required');
  if (!data.name) errors.push('Product name is required');
  if (!data.category) errors.push('Product category is required');
  if (typeof data.unitPrice !== 'number' || data.unitPrice <= 0) {
    errors.push('Unit price must be a positive number');
  }
  if (typeof data.reorderLevel !== 'number' || data.reorderLevel < 0) {
    errors.push('Reorder level must be a non-negative number');
  }
  if (typeof data.maxStock !== 'number' || data.maxStock <= 0) {
    errors.push('Max stock must be a positive number');
  }

  return errors;
};

// Supplier Validators
const validateSupplier = (data) => {
  const errors = [];

  if (!data.id) errors.push('Supplier ID is required');
  if (!data.code) errors.push('Supplier code is required');
  if (!data.name) errors.push('Supplier name is required');
  if (!data.email) errors.push('Email is required');
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  return errors;
};

// Inventory Validators
const validateInventory = (data) => {
  const errors = [];

  if (!data.productId) errors.push('Product ID is required');
  if (!data.warehouseLocation) errors.push('Warehouse location is required');
  if (typeof data.quantityOnHand !== 'number' || data.quantityOnHand < 0) {
    errors.push('Quantity on hand must be a non-negative number');
  }
  if (typeof data.quantityReserved !== 'number' || data.quantityReserved < 0) {
    errors.push('Quantity reserved must be a non-negative number');
  }

  return errors;
};

// Inventory Adjustment Validators
const validateAdjustment = (data) => {
  const errors = [];

  if (!data.quantity && data.quantity !== 0) {
    errors.push('Quantity is required');
  }
  if (typeof data.quantity !== 'number') {
    errors.push('Quantity must be a number');
  }
  if (!data.reason) errors.push('Reason is required');

  return errors;
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateProduct,
  validateSupplier,
  validateInventory,
  validateAdjustment,
};
