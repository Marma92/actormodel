const Actor = require('../actors/actor');

class OrderServiceActor extends Actor {
  async handleMessage(message) {
    switch (message.type) {
      case 'CREATE_ORDER':
        // Process order creation
        console.log('Order created:', message.order);
        break;
      case 'UPDATE_ORDER_STATUS':
        // Update order status
        console.log('Order status updated:', message.orderId, message.status);
        break;
      // Other message types handled here
    }
  }
}

module.exports = OrderServiceActor;
