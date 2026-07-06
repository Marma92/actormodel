const { test, before, after } = require('node:test');
const assert = require('node:assert');
const Actor = require('../actors/actor');
const InventoryServiceActor = require('../services/inventoryService');
const { initializeDatabase, db } = require('../db/initialize');

async function until(condition) {
  while (!condition()) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

class ProbeActor extends Actor {
  constructor() {
    super();
    this.messages = [];
  }

  async handleMessage(message) {
    this.messages.push(message);
  }
}

before(() => initializeDatabase());
after(() => db.close());

test('reservation decrements stock and forwards payment', async () => {
  const probe = new ProbeActor();
  const inventory = new InventoryServiceActor({ paymentService: probe });

  inventory.receiveMessage({ type: 'ADD_STOCK', productId: 'p1', quantity: 5 });
  inventory.receiveMessage({
    type: 'RESERVE_ITEMS',
    order: { id: 'o1', items: [{ productId: 'p1', quantity: 2 }], amount: 10 },
  });

  await until(() => probe.messages.length === 1);
  assert.deepStrictEqual(probe.messages[0], {
    type: 'PROCESS_PAYMENT',
    orderId: 'o1',
    amount: 10,
  });

  // Insufficient stock: no payment message, stock unchanged.
  inventory.receiveMessage({
    type: 'RESERVE_ITEMS',
    order: { id: 'o2', items: [{ productId: 'p1', quantity: 99 }], amount: 1 },
  });
  await until(() => !inventory.processing && inventory.mailbox.length === 0);
  assert.strictEqual(probe.messages.length, 1);

  const row = await new Promise((resolve, reject) => {
    db.get(
      'SELECT quantity FROM inventory WHERE product_id = ?',
      ['p1'],
      (err, r) => (err ? reject(err) : resolve(r))
    );
  });
  assert.strictEqual(row.quantity, 3);
});
