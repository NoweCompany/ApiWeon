import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import configCors from './middlewares/configCors';

import usersRoutes from './routes/usersRouter';
import tokenRoutes from './routes/tokenRouter';
import tableRoutes from './routes/tableRouter';
import fieldRoutes from './routes/fieldRouter';
import valueRoutes from './routes/valueRouter';
import templateRouter from './routes/templateRouter';
import downloadRouter from './routes/downloadRouter';

dotenv.config();

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(helmet());
    this.app.use(configCors);
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/template', templateRouter);
    this.app.use('/users', usersRoutes);
    this.app.use('/token', tokenRoutes);
    this.app.use('/collection', tableRoutes);
    this.app.use('/field', fieldRoutes);
    this.app.use('/value', valueRoutes);
    this.app.use('/download', downloadRouter);
  }
}

export default new App().app;
