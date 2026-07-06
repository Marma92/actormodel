// Minimal one-for-one supervision: on failure the actor is restarted
// (state reset, failing message dropped); past maxRestarts it is stopped.
class Supervisor {
  constructor({ maxRestarts = 3 } = {}) {
    this.maxRestarts = maxRestarts;
    this.failures = new Map();
  }

  supervise(actor) {
    actor.supervisor = this;
    this.failures.set(actor, 0);
    return actor;
  }

  onFailure(actor, error, message) {
    const failures = this.failures.get(actor) + 1;
    this.failures.set(actor, failures);
    if (failures > this.maxRestarts) {
      console.error(
        `Supervisor: stopping ${actor.constructor.name} after ${this.maxRestarts} restarts (${error.message})`
      );
      actor.stop();
    } else {
      console.error(
        `Supervisor: restarting ${actor.constructor.name} (${error.message})`
      );
      actor.restart();
    }
  }
}

module.exports = Supervisor;
