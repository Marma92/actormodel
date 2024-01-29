const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const MyActor = require('./myActor');
  const actor1 = new MyActor();
  const actor2 = new MyActor();

  actor1.sendMessage({ type: 'INCREMENT' }, actor2);
  actor1.sendMessage({ type: 'INCREMENT' }, actor2);
  actor2.sendMessage({ type: 'DECREMENT' }, actor1);
}
