import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import configCors from './middlewares/configCors';

import usersRoutes from './routes/usersRouter';
import tokenRoutes from './routes/tokenRouter';
import tableRoutes from './routes/collectionRouter';
import fieldRoutes from './routes/fieldRouter';
import valueRoutes from './routes/valueRouter';
import trashRouter from './routes/trashRouter';
import downloadRouter from './routes/downloadRouter';
import chartsRouter from './routes/chartsRouter';
import kpiRouter from './routes/kpiRouter';
import dashboardRouter from './routes/dashboardRouter';
import historicRouter from './routes/historicRouter';

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
    this.app.use(express.static(path.resolve(__dirname, '..', 'uploads')));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/users', usersRoutes);
    this.app.use('/token', tokenRoutes);
    this.app.use('/collection', tableRoutes);
    this.app.use('/field', fieldRoutes);
    this.app.use('/value', valueRoutes);
    this.app.use('/trash', trashRouter);
    this.app.use('/download', downloadRouter);
    this.app.use('/dashboard', dashboardRouter);
    this.app.use('/chart', chartsRouter);
    this.app.use('/kpi', kpiRouter);
    this.app.use('/historic', historicRouter);
  }
}

export default new App().app;
