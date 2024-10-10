import cluster from 'cluster';
import App from './app';
import config from './config';
import workerProcess from './worker';

if (cluster.isPrimary) {
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died. Code ${code}, Signal ${signal}`);
  });

  const app = new App();
  app.run(config);

  cluster.fork();
} else {
  workerProcess(config);
}

