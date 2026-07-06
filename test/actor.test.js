const { test } = require('node:test');
const assert = require('node:assert');
const Actor = require('../actors/actor');
const Supervisor = require('../actors/supervisor');

async function until(condition) {
  while (!condition()) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

class RecorderActor extends Actor {
  constructor() {
    super();
    this.seen = [];
  }

  async handleMessage(message) {
    if (message.delay) {
      await new Promise((resolve) => setTimeout(resolve, message.delay));
    }
    if (message.boom) {
      throw new Error('boom');
    }
    this.seen.push(message.id);
  }
}

test('messages are processed sequentially, in arrival order', async () => {
  const actor = new RecorderActor();
  actor.receiveMessage({ id: 1, delay: 20 });
  actor.receiveMessage({ id: 2 });
  actor.receiveMessage({ id: 3, delay: 10 });
  await until(() => actor.seen.length === 3);
  assert.deepStrictEqual(actor.seen, [1, 2, 3]);
});

test('sending is asynchronous: handler does not run on the sender stack', () => {
  const actor = new RecorderActor();
  actor.receiveMessage({ id: 1 });
  assert.deepStrictEqual(actor.seen, []);
});

test('a failing message does not block the following ones', async () => {
  const actor = new RecorderActor();
  actor.receiveMessage({ id: 1, boom: true });
  actor.receiveMessage({ id: 2 });
  await until(() => actor.seen.length === 1);
  assert.deepStrictEqual(actor.seen, [2]);
});

test('supervisor restarts a failing actor, then stops it past maxRestarts', async () => {
  class FragileActor extends Actor {
    constructor() {
      super();
      this.restarts = 0;
    }

    async handleMessage() {
      throw new Error('always fails');
    }

    restart() {
      this.restarts++;
    }
  }

  const supervisor = new Supervisor({ maxRestarts: 2 });
  const actor = supervisor.supervise(new FragileActor());
  for (let i = 0; i < 3; i++) {
    actor.receiveMessage({});
  }
  await until(() => actor.stopped);
  assert.strictEqual(actor.restarts, 2);

  // A stopped actor ignores further messages.
  actor.receiveMessage({});
  assert.strictEqual(actor.mailbox.length, 0);
});
