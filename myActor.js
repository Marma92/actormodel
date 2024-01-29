const Actor = require('./actor');

class MyActor extends Actor {
  constructor() {
    super();
    this.state = 0;
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'INCREMENT':
        this.state++;
        console.log('State incremented:', this.state);
        break;
      case 'DECREMENT':
        this.state--;
        console.log('State decremented:', this.state);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
}

module.exports = MyActor;
