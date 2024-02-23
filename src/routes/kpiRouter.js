import { Router } from 'express';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import ValueService from '../services/ValueService.js';
import FieldsConfigService from '../services/fieldsconfigSevice.js';
import KpiService from '../services/KpiService.js';

import KpiController from '../controllers/kpiController.js';


const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const fieldsConfigService = new FieldsConfigService(mongoInstance.client);
const kpiService = new KpiService(mongoInstance.client);
const kpiController = new KpiController(mongoDbValidation, kpiService, fieldsConfigService);


const routes = new Router();
routes.post('/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  kpiController.store.bind(kpiController));

export default routes;
