const { validateProduct, validateSupplier, validateInventory, validateAdjustment } = require('../utils/validators');

// Validation middleware for product creation/update
const validateProductData = (req, res, next) => {
  const errors = validateProduct(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validation middleware for supplier creation/update
const validateSupplierData = (req, res, next) => {
  const errors = validateSupplier(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validation middleware for inventory creation/update
const validateInventoryData = (req, res, next) => {
  const errors = validateInventory(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Validation middleware for inventory adjustment
const validateInventoryAdjustmentData = (req, res, next) => {
  const errors = validateAdjustment(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateProductData,
  validateSupplierData,
  validateInventoryData,
  validateInventoryAdjustmentData,
};
