import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import socketio from 'socket.io';
import http from 'http';
import cors from 'cors';
// import BullBoard from 'bull-board';

import routes from './routes';
import Queue from './services/Queue';

// Limite de 1200 Request a cada 10 min.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1200,
});

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);

    this.state = {
      hashtag: '',
      monitoring: false,
      received: [],
      approved: [],
      rejected: [],
    };

    this.websockets();

    this.middlewares();
    this.routes();
    this.resetJobs();
  }

  websockets() {
    this.io.on('connection', socket => {
      console.log('Usuário Conectado', socket.id);

      socket.emit('initialState', this.state);
    });
  }

  middlewares() {
    // this.server.use(limiter);
    // this.server.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(logger('dev'));
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use((req, res, next) => {
      req.io = this.io;
      req.state = this.state;

      return next();
    });
  }

  routes() {
    // BullBoard.setQueues([Queue]);
    // this.app.use('/admin/queues', BullBoard.UI);
    this.app.use('/api', routes);
  }

  async resetJobs() {
    await Queue.pause();
    await Queue.empty();
    await Queue.isReady();
  }
}

export default new App().server;
