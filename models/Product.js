const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    retail_price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    distribution_center_id: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ department: 1 });
productSchema.index({ retail_price: 1 });

module.exports = mongoose.model('Product', productSchema);
