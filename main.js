const OrderServiceActor = require('./services/orderService');
const InventoryServiceActor = require('./services/inventoryService');
const PaymentServiceActor = require('./services/paymentService');
const NotificationServiceActor = require('./services/notificationService');
const initializeDatabase = require('./db/initialize');

initializeDatabase();

// Create instances of microservice actors
const orderService = new OrderServiceActor();
const inventoryService = new InventoryServiceActor();
const paymentService = new PaymentServiceActor();
const notificationService = new NotificationServiceActor();

// Simulate message passing interactions
const orderMessage = {
  type: 'CREATE_ORDER',
  order: { id: '123', items: ['product1', 'product2'] },
};
orderService.sendMessage(orderMessage, orderService);

const paymentMessage = { type: 'PROCESS_PAYMENT', orderId: '123', amount: 100 };
paymentService.sendMessage(paymentMessage, paymentService);

// Add more message passing interactions as needed
