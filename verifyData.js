const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('products.db');

// Function to run a query and log results
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error running query:', err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function verifyData() {
  try {
    console.log('Verifying database...\n');

    // 1. Check total number of records
    const totalRecords = await runQuery('SELECT COUNT(*) as count FROM products');
    console.log(`Total records in database: ${totalRecords[0].count}`);

    // 2. Get sample records
    console.log('\nSample records (first 5):');
    const sampleRecords = await runQuery('SELECT * FROM products LIMIT 5');
    console.table(sampleRecords);

    // 3. Check data distribution by category
    console.log('\nRecords by category (top 5):');
    const categories = await runQuery(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC LIMIT 5'
    );
    console.table(categories);

    // 4. Check data distribution by department
    console.log('\nRecords by department:');
    const departments = await runQuery(
      'SELECT department, COUNT(*) as count FROM products GROUP BY department ORDER BY count DESC'
    );
    console.table(departments);

    // 5. Check for any data quality issues
    console.log('\nChecking for data quality issues...');
    const nullChecks = await Promise.all([
      runQuery('SELECT COUNT(*) as count FROM products WHERE id IS NULL'),
      runQuery('SELECT COUNT(*) as count FROM products WHERE name IS NULL OR name = ""'),
      runQuery('SELECT COUNT(*) as count FROM products WHERE sku IS NULL OR sku = ""')
    ]);

    console.log(`\nData Quality Check:`);
    console.log(`- Records with NULL id: ${nullChecks[0][0].count}`);
    console.log(`- Records with NULL or empty name: ${nullChecks[1][0].count}`);
    console.log(`- Records with NULL or empty sku: ${nullChecks[2][0].count}`);

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the verification
verifyData();
