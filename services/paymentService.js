const Actor = require('../actors/actor');

class PaymentServiceActor extends Actor {
  constructor({ notificationService } = {}) {
    super();
    this.notificationService = notificationService;
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'PROCESS_PAYMENT':
        console.log(
          'Payment processed for order',
          message.orderId,
          '- amount:',
          message.amount
        );
        this.send(this.notificationService, {
          type: 'SEND_NOTIFICATION',
          orderId: message.orderId,
          text: `Order ${message.orderId} confirmed`,
        });
        break;
      default:
        console.log('PaymentService: unknown message type:', message.type);
    }
  }
}

module.exports = PaymentServiceActor;
