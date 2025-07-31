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

// Import the Product model
const Product = require('./models/Product');

// Read and process the CSV file
const products = [];
let rowCount = 0;

console.log('Starting import process...');

fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    rowCount++;
    // Skip the header row if it exists
    if (row.id === 'id') return;
    
    try {
      // Skip rows with missing required fields
      if (!row.id || !row.name || !row.category || !row.brand || !row.department || !row.sku) {
        console.warn(`Skipping row ${rowCount} - Missing required fields`);
        return;
      }

      const product = {
        id: parseInt(row.id, 10) || 0,
        name: row.name.trim() || 'Unnamed Product',
        cost: parseFloat(row.cost) || 0,
        retail_price: parseFloat(row.retail_price) || 0,
        category: row.category.trim() || 'Uncategorized',
        brand: row.brand.trim() || 'Unbranded',
        department: row.department.trim() || 'General',
        sku: row.sku.trim() || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        distribution_center_id: parseInt(row.distribution_center_id, 10) || 1
      };
      
      // Only add if we have a valid ID and name
      if (product.id && product.name !== 'Unnamed Product') {
        products.push(product);
      }
      
      // Log progress every 1000 rows
      if (rowCount % 1000 === 0) {
        console.log(`Processed ${rowCount} rows...`);
      }
    } catch (error) {
      console.error(`Error processing row ${rowCount}:`, error);
    }
  })
  .on('end', async () => {
    try {
      console.log(`Finished reading CSV. Found ${products.length} products to import.`);
      
      if (products.length === 0) {
        console.log('No products found to import.');
        return mongoose.connection.close();
      }
      
      // Clear existing products
      console.log('Clearing existing products...');
      await Product.deleteMany({});
      
      // Insert new products in batches to avoid memory issues
      const batchSize = 1000;
      let importedCount = 0;
      
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await Product.insertMany(batch);
        importedCount += batch.length;
        console.log(`Imported ${importedCount}/${products.length} products...`);
      }
      
      console.log(`Successfully imported ${importedCount} products`);
      
      // Create indexes after import for better performance
      console.log('Creating indexes...');
      await Product.init();
      
      console.log('Import completed successfully!');
    } catch (error) {
      console.error('Error during import:', error);
    } finally {
      mongoose.connection.close();
    }
  });
