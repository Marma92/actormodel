const Actor = require('../actors/actor');
const sqlite3 = require('sqlite3').verbose();

// Create a SQLite database connection
const db = new sqlite3.Database(':memory:');

class InventoryServiceActor extends Actor {
  async handleMessage(message) {
    switch (message.type) {
      case 'CHECK_INVENTORY':
        // Check product availability
        this.checkInventory(message.productId);
        break;
      case 'RESERVE_INVENTORY':
        // Reserve inventory for an order
        await this.reserveInventory(message.productId, message.quantity);
        break;
      // Other message types handled here
    }
  }

  // Method to check product availability in SQLite
  checkInventory(productId) {
    db.get(
      'SELECT quantity FROM inventory WHERE product_id = ?',
      [productId],
      (err, row) => {
        if (err) {
          console.error('Error checking inventory:', err);
        } else {
          if (row) {
            console.log(
              `Product ${productId} available. Quantity: ${row.quantity}`
            );
          } else {
            console.log(`Product ${productId} not found in inventory.`);
          }
        }
      }
    );
  }

  // Method to reserve inventory for an order in SQLite
  async reserveInventory(productId, quantity) {
    try {
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          db.get(
            'SELECT quantity FROM inventory WHERE product_id = ? FOR UPDATE',
            [productId],
            async (err, row) => {
              if (err) {
                await this.rollbackAndReject(err, reject);
              } else {
                if (row && row.quantity >= quantity) {
                  await this.updateInventory(
                    productId,
                    quantity,
                    resolve,
                    reject
                  );
                } else {
                  await this.rollbackAndReject(
                    new Error(
                      `Insufficient inventory for product ${productId}.`
                    ),
                    reject
                  );
                }
              }
            }
          );
        });
      });
    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw error;
    }
  }

  // Helper method to update inventory for a product in the database
  async updateInventory(productId, quantity, resolve, reject) {
    db.run(
      'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?',
      [quantity, productId],
      function (err) {
        if (err) {
          this.rollbackAndReject(err, reject);
        } else if (this.changes === 0) {
          this.rollbackAndReject(
            new Error(`Insufficient inventory for product ${productId}.`),
            reject
          );
        } else {
          db.run('COMMIT');
          console.log(
            `Inventory for product ${productId} reserved successfully.`
          );
          resolve();
        }
      }
    );
  }

  // Helper method to rollback transaction and reject promise with error
  rollbackAndReject(err, reject) {
    db.run('ROLLBACK');
    console.error('Error reserving inventory:', err);
    reject(err);
  }
}

module.exports = InventoryServiceActor;
