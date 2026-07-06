const OrderServiceActor = require('./services/orderService');
const InventoryServiceActor = require('./services/inventoryService');
const PaymentServiceActor = require('./services/paymentService');
const NotificationServiceActor = require('./services/notificationService');
const Supervisor = require('./actors/supervisor');
const { initializeDatabase, db } = require('./db/initialize');

async function main() {
  await initializeDatabase();
  console.log('Database initialized successfully.');

  // Wire up the actor pipeline: order -> inventory -> payment -> notification.
  // Every actor is supervised: on failure it is restarted, and stopped
  // if it keeps failing.
  const supervisor = new Supervisor({ maxRestarts: 3 });
  const notificationService = supervisor.supervise(new NotificationServiceActor());
  const paymentService = supervisor.supervise(new PaymentServiceActor({ notificationService }));
  const inventoryService = supervisor.supervise(new InventoryServiceActor({ paymentService }));
  const orderService = supervisor.supervise(new OrderServiceActor({ inventoryService }));

  inventoryService.receiveMessage({ type: 'ADD_STOCK', productId: 'product1', quantity: 10 });
  inventoryService.receiveMessage({ type: 'ADD_STOCK', productId: 'product2', quantity: 5 });

  orderService.receiveMessage({
    type: 'CREATE_ORDER',
    order: {
      id: '123',
      items: [
        { productId: 'product1', quantity: 2 },
        { productId: 'product2', quantity: 1 },
      ],
      amount: 100,
    },
  });

  // This order asks for more product2 than is in stock: reservation fails.
  orderService.receiveMessage({
    type: 'CREATE_ORDER',
    order: {
      id: '124',
      items: [{ productId: 'product2', quantity: 99 }],
      amount: 500,
    },
  });
}

main().catch((err) => {
  console.error(err);
  db.close();
  process.exitCode = 1;
});
