const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database('products.db');

// Read the CSV file
const csvFilePath = path.join(__dirname, 'products.csv');
const records = [];

console.log('Starting CSV import...');

// Create the products table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    cost REAL,
    category TEXT,
    name TEXT,
    brand TEXT,
    retail_price REAL,
    department TEXT,
    sku TEXT UNIQUE,
    distribution_center_id INTEGER
  )`);

  // Create indexes for better query performance
  db.run('CREATE INDEX IF NOT EXISTS idx_category ON products(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_department ON products(department)');
  db.run('CREATE INDEX IF NOT EXISTS idx_brand ON products(brand)');

  // Start a transaction for better performance
  db.run('BEGIN TRANSACTION');

  // Read and parse the CSV file
  fs.createReadStream(csvFilePath)
    .pipe(parse({ 
      delimiter: ',',
      columns: true, // Use the first line as column names
      skip_empty_lines: true
    }))
    .on('data', (row) => {
      // Prepare the insert statement
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO products 
        (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Execute the statement with the row data
      stmt.run(
        row.id,
        row.cost,
        row.category,
        row.name,
        row.brand,
        row.retail_price,
        row.department,
        row.sku,
        row.distribution_center_id
      );
      
      stmt.finalize();
    })
    .on('end', () => {
      // Commit the transaction
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err);
        } else {
          console.log('CSV file successfully imported into SQLite database');
        }
        // Close the database connection
        db.close();
      });
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      db.run('ROLLBACK');
      db.close();
    });
});
