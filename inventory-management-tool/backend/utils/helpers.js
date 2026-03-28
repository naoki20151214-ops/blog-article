const { v4: uuidv4 } = require('uuid');

// Generate a unique ID
const generateId = () => {
  return uuidv4();
};

// Generate product ID
const generateProductId = () => {
  return `PROD-${Date.now()}`;
};

// Generate supplier ID
const generateSupplierId = () => {
  return `SUP-${Date.now()}`;
};

// Generate inventory ID
const generateInventoryId = () => {
  return `INV-${Date.now()}`;
};

// Calculate available quantity
const calculateAvailableQuantity = (quantityOnHand, quantityReserved) => {
  return Math.max(0, quantityOnHand - quantityReserved);
};

// Format response
const formatResponse = (success, data = null, error = null) => {
  return {
    success,
    data,
    error,
  };
};

// Format error response
const formatErrorResponse = (message, details = null) => {
  return {
    success: false,
    error: message,
    details,
  };
};

module.exports = {
  generateId,
  generateProductId,
  generateSupplierId,
  generateInventoryId,
  calculateAvailableQuantity,
  formatResponse,
  formatErrorResponse,
};
