const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-ecommerce';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    stock: Number,
    image: String,
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Read and process the CSV file
const products = [];

fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Transform the data as needed to match your schema
    const product = {
      name: row.name || row.title || row.product_name,
      description: row.description || '',
      price: parseFloat(row.price || 0),
      category: row.category || 'Uncategorized',
      stock: parseInt(row.stock || row.quantity || 0, 10),
      image: row.image || row.image_url || ''
    };
    products.push(product);
  })
  .on('end', async () => {
    try {
      // Clear existing products (optional)
      await Product.deleteMany({});
      
      // Insert new products
      const result = await Product.insertMany(products);
      console.log(`Successfully imported ${result.length} products`);
      
      // Close the MongoDB connection
      mongoose.connection.close();
    } catch (error) {
      console.error('Error importing products:', error);
      mongoose.connection.close();
    }
  });
