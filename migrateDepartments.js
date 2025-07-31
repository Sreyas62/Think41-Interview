const mongoose = require('mongoose');
const Product = require('./models/Product');
const Department = require('./models/Department');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function migrateDepartments() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all unique department names from products
    const departments = await Product.distinct('department');
    console.log(`Found ${departments.length} unique departments`);

    // Create department documents and get their IDs
    const departmentDocs = await Promise.all(
      departments.map(name => Department.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ))
    );

    console.log('Created/Updated departments:', departmentDocs.length);

    // Create a map of department name to _id
    const deptMap = {};
    departmentDocs.forEach(dept => {
      deptMap[dept.name] = dept._id;
    });

    // Update all products with department references
    const products = await Product.find({});
    console.log(`Updating ${products.length} products...`);

    const bulkOps = products.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: { 
          $set: { 
            department: deptMap[product.department],
            oldDepartment: product.department // Keep the old value for reference
          } 
        }
      }
    }));

    // Process in batches of 1000
    const BATCH_SIZE = 1000;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await Product.bulkWrite(batch);
      console.log(`Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} products`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDepartments();
