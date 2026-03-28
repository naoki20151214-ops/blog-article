const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { validateSupplierData } = require('../middleware/validation');

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }
    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET products supplied by specific supplier
router.get('/:id/products', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    const products = await Product.findBySupplier(req.params.id);
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST create new supplier
router.post('/', validateSupplierData, async (req, res) => {
  try {
    const {
      id,
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
      paymentTerms,
      status,
      rating,
    } = req.body;

    // Check if supplier already exists
    const existing = await Supplier.findById(id);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Supplier with this ID already exists',
      });
    }

    const supplier = await Supplier.create({
      id,
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
      paymentTerms,
      status,
      rating,
    });

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    const updated = await Supplier.updateById(req.params.id, req.body);

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

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found',
      });
    }

    await Supplier.deleteById(req.params.id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
