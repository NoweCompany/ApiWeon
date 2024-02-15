import { Router } from 'express';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import convertTypeToBsonType from '../utils/convertTypeToBsonType.js'
import ValueService from '../services/ValueService.js';
import HistoricController from '../controllers/historicController.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const valueService = new ValueService(mongoInstance.client, convertTypeToBsonType);
const historicController = new HistoricController(mongoDbValidation, valueService);

const routes = new Router();

routes.get('/:limit?',
  login.loginRequire.bind(login),
  permission('adm'),
  historicController.index.bind(historicController)
);

routes.get('/show/:id',
  login.loginRequire.bind(login),
  permission('adm'),
  historicController.show.bind(historicController)
);

export default routes;
