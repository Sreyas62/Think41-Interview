const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Get the Product model
    const Product = mongoose.model('Product', new mongoose.Schema({}), 'products');
    
    // Count total products
    Product.countDocuments({})
      .then(count => {
        console.log(`Total products in database: ${count}`);
        
        // Get a sample of products
        return Product.find().limit(3);
      })
      .then(products => {
        console.log('\nSample products:');
        console.log(JSON.stringify(products, null, 2));
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
