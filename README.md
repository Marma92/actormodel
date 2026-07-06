# Actor Model Implementation in Node.js

This project demonstrates an implementation of the Actor Model in Node.js, a computational model used for concurrent and distributed computing. Actors are independent entities that communicate through asynchronous message passing, enabling scalable and efficient concurrency.

## How it works

- `actors/actor.js`: The base `Actor` class. Each actor owns a mailbox; incoming messages are queued and processed **asynchronously and sequentially** (one message at a time per actor), which is what guarantees consistency without locks.
- `actors/supervisor.js`: Minimal one-for-one **supervision**: when a supervised actor's handler throws, the supervisor restarts it (`restart()` resets state, the failing message is dropped); past `maxRestarts` the actor is stopped and ignores further messages.
- `myActor.js`: A minimal example subclass (counter actor).
- `services/`: A small microservices-style demo built on actors:
  - `orderService.js` — receives `CREATE_ORDER`, forwards a reservation request to inventory.
  - `inventoryService.js` — manages stock in SQLite (`ADD_STOCK`, `RESERVE_ITEMS`), forwards to payment on success.
  - `paymentService.js` — processes `PROCESS_PAYMENT`, forwards to notification.
  - `notificationService.js` — handles `SEND_NOTIFICATION`.
- `db/initialize.js`: Shared in-memory SQLite database used by the inventory service.
- `main.js`: Wires the actors together and runs the demo pipeline: order → inventory → payment → notification, including a failure case (insufficient stock).

## Usage

1. Ensure you have Node.js installed on your system.
2. Install dependencies:

   > npm install

3. Run the demo:

   > npm start

4. Run the tests (built-in Node.js test runner, no extra dependency):

   > npm test

Expected output:

```
Database initialized successfully.
Order created: 123
Order created: 124
Stock added: product1 +10
Stock added: product2 +5
Items reserved for order 123
Payment processed for order 123 - amount: 100
Notification sent for order 123 - Order 123 confirmed
Reservation failed for order 124 - insufficient stock: product2
```

## Tests

The `test/` directory covers the core actor guarantees — mailbox ordering, asynchronous delivery, failure isolation, supervision (restart then stop) — plus an integration test of the inventory reservation flow against SQLite.

## Potential Improvements

1. **Actor addresses**: Route messages through a registry instead of direct object references, enabling location transparency.
2. **Compensation / sagas**: Release reserved stock when payment fails.
3. **Persistence**: Use a file-backed database instead of `:memory:`.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests with improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
