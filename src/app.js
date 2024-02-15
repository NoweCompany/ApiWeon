import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import configCors from './middlewares/configCors.js';

import usersRoutes from './routes/usersRouter.js';
import collectionRouter from './routes/collectionRouter.js';
import tokenRoutes from './routes/tokenRouter.js';
import fieldRoutes from './routes/fieldRouter.js';
import valueRoutes from './routes/valueRouter.js';
import trashRouter from './routes/trashRouter.js';
// import downloadRouter from './routes/downloadRouter.js';
// import uploadRouter from './routes/uploadRouter.js';
// import chartsRouter from './routes/chartsRouter.js';
// import kpiRouter from './routes/kpiRouter.js';
// import dashboardRouter from './routes/dashboardRouter.js';
import historicRouter from './routes/historicRouter.js';

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
    this.app.use(express.static(path.resolve('uploads')));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/users', usersRoutes);
    this.app.use('/collection', collectionRouter);
    this.app.use('/token', tokenRoutes);
    this.app.use('/field', fieldRoutes);
    this.app.use('/value', valueRoutes);
    this.app.use('/trash', trashRouter);
    // this.app.use('/download', downloadRouter);
    // this.app.use('/upload', uploadRouter);
    // this.app.use('/dashboard', dashboardRouter);
    // this.app.use('/chart', chartsRouter);
    // this.app.use('/kpi', kpiRouter);
    this.app.use('/historic', historicRouter);
  }
}

export default new App().app;
