const Product = require('../models/Product');
const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');

// @desc    Fetch all products with pagination and filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        
        // Filter by category if provided
        if (req.query.category) {
            query.category = { $regex: req.query.category, $options: 'i' };
        }
        
        // Filter by department if provided
        if (req.query.department) {
            const department = await Department.findOne({ name: { $regex: req.query.department, $options: 'i' } });
            if (department) {
                query.department = department._id;
            } else {
                // If department not found, return empty results
                return res.json({
                    success: true,
                    count: 0,
                    total: 0,
                    page,
                    pages: 0,
                    data: []
                });
            }
        }
        
        // Search by keyword if provided
        if (req.query.keyword) {
            query.$or = [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } },
                { brand: { $regex: req.query.keyword, $options: 'i' } },
                { category: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        // Execute query with pagination and populate department
        const products = await Product.find(query)
            .populate('department', 'name')
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id })
            .populate('department', 'name');
            
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error(`Error fetching product ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @desc    Get all departments
// @route   GET /api/products/departments
// @access  Public
const getDepartments = asyncHandler(async (req, res) => {
    try {
        const departments = await Department.find({}, 'name').sort({ name: 1 });
        
        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = {
    getProducts,
    getProductById,
    getDepartments
};
