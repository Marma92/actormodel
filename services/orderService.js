const Actor = require('../actors/actor');

class OrderServiceActor extends Actor {
  constructor({ inventoryService } = {}) {
    super();
    this.inventoryService = inventoryService;
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'CREATE_ORDER':
        console.log('Order created:', message.order.id);
        this.send(this.inventoryService, {
          type: 'RESERVE_ITEMS',
          order: message.order,
        });
        break;
      case 'UPDATE_ORDER_STATUS':
        console.log('Order status updated:', message.orderId, message.status);
        break;
      default:
        console.log('OrderService: unknown message type:', message.type);
    }
  }
}

module.exports = OrderServiceActor;
