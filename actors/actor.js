class Actor {
  constructor() {
    this.mailbox = [];
    this.processing = false;
    this.stopped = false;
    this.supervisor = null;
  }

  send(target, message) {
    target.receiveMessage(message);
  }

  receiveMessage(message) {
    if (this.stopped) return;
    this.mailbox.push(message);
    if (!this.processing) {
      this.processing = true;
      // Defer processing so sending never runs the target's handler
      // on the sender's call stack.
      setImmediate(() => this.processMessages());
    }
  }

  async processMessages() {
    while (this.mailbox.length > 0 && !this.stopped) {
      const message = this.mailbox.shift();
      try {
        await this.handleMessage(message);
      } catch (error) {
        if (this.supervisor) {
          this.supervisor.onFailure(this, error, message);
        } else {
          console.error('Error handling message:', error.message);
        }
      }
    }
    this.processing = false;
  }

  async handleMessage(message) {
    throw new Error('handleMessage method must be implemented by subclasses');
  }

  // Called by a supervisor after a failure; subclasses reset their state here.
  restart() {}

  stop() {
    this.stopped = true;
    this.mailbox = [];
  }
}

module.exports = Actor;
