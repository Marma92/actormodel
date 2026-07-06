class Actor {
  constructor() {
    this.mailbox = [];
    this.processing = false;
  }

  send(target, message) {
    target.receiveMessage(message);
  }

  receiveMessage(message) {
    this.mailbox.push(message);
    if (!this.processing) {
      this.processing = true;
      // Defer processing so sending never runs the target's handler
      // on the sender's call stack.
      setImmediate(() => this.processMessages());
    }
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
    this.processing = false;
  }

  async handleMessage(message) {
    throw new Error('handleMessage method must be implemented by subclasses');
  }
}

module.exports = Actor;
