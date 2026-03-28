const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { validateProductData } = require('../middleware/validation');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
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

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.category);
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

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const results = await Product.search(req.params.query);
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST create new product
router.post('/', validateProductData, async (req, res) => {
  try {
    const {
      id,
      code,
      name,
      description,
      category,
      unit,
      unitPrice,
      supplierId,
      reorderLevel,
      maxStock,
      status,
      notes,
    } = req.body;

    // Check if product already exists
    const existing = await Product.findById(id);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Product with this ID already exists',
      });
    }

    const product = await Product.create({
      id,
      code,
      name,
      description,
      category,
      unit,
      unitPrice,
      supplierId,
      reorderLevel,
      maxStock,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const updated = await Product.updateById(req.params.id, req.body);

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

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    await Product.deleteById(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
