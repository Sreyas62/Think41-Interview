const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/products
// @desc    Get all products with optional filtering and pagination
// @access  Public
router.get('/', productController.getProducts);

// @route   GET /api/products/departments
// @desc    Get all departments
// @access  Public
router.get('/departments', productController.getDepartments);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', productController.getProductById);

module.exports = router;
