const Actor = require('../actors/actor');
const { db } = require('../db/initialize');

function run(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}

function get(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

class InventoryServiceActor extends Actor {
  constructor({ paymentService } = {}) {
    super();
    this.paymentService = paymentService;
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'ADD_STOCK':
        await run(
          'INSERT INTO inventory (product_id, quantity) VALUES (?, ?) ' +
            'ON CONFLICT(product_id) DO UPDATE SET quantity = quantity + excluded.quantity',
          [message.productId, message.quantity]
        );
        console.log('Stock added:', message.productId, `+${message.quantity}`);
        break;
      case 'RESERVE_ITEMS': {
        const { order } = message;
        // Per-actor sequential processing makes this check-then-update safe:
        // no other reservation can interleave between the SELECT and UPDATE.
        for (const item of order.items) {
          const row = await get(
            'SELECT quantity FROM inventory WHERE product_id = ?',
            [item.productId]
          );
          if (!row || row.quantity < item.quantity) {
            console.log(
              'Reservation failed for order',
              order.id,
              '- insufficient stock:',
              item.productId
            );
            return;
          }
        }
        for (const item of order.items) {
          await run(
            'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?',
            [item.quantity, item.productId]
          );
        }
        console.log('Items reserved for order', order.id);
        this.send(this.paymentService, {
          type: 'PROCESS_PAYMENT',
          orderId: order.id,
          amount: order.amount,
        });
        break;
      }
      default:
        console.log('InventoryService: unknown message type:', message.type);
    }
  }
}

module.exports = InventoryServiceActor;
