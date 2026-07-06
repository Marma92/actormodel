const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.run(
      'CREATE TABLE IF NOT EXISTS inventory (product_id TEXT PRIMARY KEY, quantity INTEGER)',
      (err) => (err ? reject(err) : resolve())
    );
  });
}

module.exports = { db, initializeDatabase };
