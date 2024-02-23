import { Router } from 'express';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import FieldsConfigService from '../services/fieldsconfigSevice.js';
import ChartsService from '../services/ChartsService.js';

import ChartsController from '../controllers/chartsController.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const fieldsConfigService = new FieldsConfigService(mongoInstance.client);
const chartsService = new ChartsService(mongoInstance.client);
const chartsController = new ChartsController(mongoDbValidation, chartsService, fieldsConfigService);

const routes = new Router();
routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  chartsController.store.bind(chartsController));

export default routes;
