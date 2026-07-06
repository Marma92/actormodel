const Actor = require('../actors/actor');

class NotificationServiceActor extends Actor {
  async handleMessage(message) {
    switch (message.type) {
      case 'SEND_NOTIFICATION':
        console.log('Notification sent for order', message.orderId, '-', message.text);
        break;
      default:
        console.log('NotificationService: unknown message type:', message.type);
    }
  }
}

module.exports = NotificationServiceActor;
