const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Fetch all products with pagination and filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Build query object for filtering
    const query = {};
    
    // Filter by category if provided
    if (req.query.category) {
        query.category = req.query.category;
    }
    
    // Filter by brand if provided
    if (req.query.brand) {
        query.brand = req.query.brand;
    }
    
    // Filter by department if provided
    if (req.query.department) {
        query.department = req.query.department;
    }
    
    // Search by name if keyword is provided
    if (req.query.keyword) {
        query.$or = [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { department: { $regex: req.query.keyword, $options: 'i' } }
        ];
    }
    
    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
        query.retail_price = {};
        if (req.query.minPrice) {
            query.retail_price.$gte = Number(req.query.minPrice);
        }
        if (req.query.maxPrice) {
            query.retail_price.$lte = Number(req.query.maxPrice);
        }
    }

    try {
        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ retail_price: 1 });

        res.json({
            success: true,
            count,
            pages: Math.ceil(count / pageSize),
            page,
            pageSize,
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
        const product = await Product.findOne({ id: req.params.id });
        
        if (product) {
            res.json({
                success: true,
                data: product
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        console.error(`Error fetching product ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = {
    getProducts,
    getProductById
};
