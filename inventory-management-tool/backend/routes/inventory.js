const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');
const { validateInventoryData, validateInventoryAdjustmentData } = require('../middleware/validation');
const { TRANSACTION_TYPES } = require('../utils/constants');

// GET all inventory
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.findAll();
    res.json({
      success: true,
      data: inventories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET inventory by ID
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }
    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET inventory by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const inventories = await Inventory.findByProductId(req.params.productId);
    res.json({
      success: true,
      data: inventories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET low stock inventory
router.get('/alert/low-stock', async (req, res) => {
  try {
    const reorderLevel = parseInt(req.query.level) || 50;
    const lowStock = await Inventory.findLowStock(reorderLevel);

    res.json({
      success: true,
      data: lowStock,
      reorderLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST create new inventory
router.post('/', validateInventoryData, async (req, res) => {
  try {
    const {
      id,
      productId,
      warehouseLocation,
      quantityOnHand,
      quantityReserved,
      reorderQuantity,
      leadTimeDays,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check if inventory already exists
    const existing = await Inventory.findById(id);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Inventory with this ID already exists',
      });
    }

    const inventory = await Inventory.create({
      id,
      productId,
      warehouseLocation,
      quantityOnHand,
      quantityReserved,
      reorderQuantity,
      leadTimeDays,
    });

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST adjust inventory quantity
router.post('/:id/adjust', validateInventoryAdjustmentData, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }

    const { quantity, reason, reference, notes, createdBy } = req.body;

    // Perform adjustment
    const previousQuantity = inventory.quantityOnHand;
    const updated = await Inventory.adjustQuantity(req.params.id, quantity);
    const newQuantity = updated.quantityOnHand;

    // Record in history
    const historyRecord = await InventoryHistory.create({
      productId: inventory.productId,
      inventoryId: req.params.id,
      transactionType: quantity > 0 ? TRANSACTION_TYPES.IN : TRANSACTION_TYPES.OUT,
      quantity: Math.abs(quantity),
      previousQuantity,
      newQuantity,
      reason,
      reference,
      notes,
      createdBy: createdBy || 'system',
    });

    res.json({
      success: true,
      data: {
        inventory: updated,
        history: historyRecord,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST record inventory count (棚卸)
router.post('/:id/count', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }

    const { countedQuantity, notes, createdBy } = req.body;

    if (typeof countedQuantity !== 'number' || countedQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Counted quantity must be a non-negative number',
      });
    }

    // Record count
    const previousQuantity = inventory.quantityOnHand;
    const updated = await Inventory.recordCount(req.params.id, countedQuantity);

    // Record in history
    const difference = countedQuantity - previousQuantity;
    const historyRecord = await InventoryHistory.create({
      productId: inventory.productId,
      inventoryId: req.params.id,
      transactionType: TRANSACTION_TYPES.COUNT,
      quantity: Math.abs(difference),
      previousQuantity,
      newQuantity: countedQuantity,
      reason: '棚卸',
      notes: notes || `棚卸: ${previousQuantity} → ${countedQuantity}`,
      createdBy: createdBy || 'system',
    });

    res.json({
      success: true,
      data: {
        inventory: updated,
        history: historyRecord,
        difference,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT update inventory
router.put('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }

    const updated = await Inventory.updateById(req.params.id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE inventory
router.delete('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }

    await Inventory.deleteById(req.params.id);

    res.json({
      success: true,
      message: 'Inventory deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
