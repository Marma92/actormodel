class Actor {
  constructor() {
    this.mailbox = [];
  }

  sendMessage(message, target) {
    target.receiveMessage(message);
  }

  async receiveMessage(message) {
    this.mailbox.push(message);
    await this.processMessages();
  }

  async processMessages() {
    while (this.mailbox.length > 0) {
      const message = this.mailbox.shift();
      try {
        await this.handleMessage(message);
      } catch (error) {
        console.error('Error handling message:', error.message);
      }
    }
  }

  async handleMessage(message) {
    throw new Error('handleMessage method must be implemented by subclasses');
  }
}

module.exports = Actor;
