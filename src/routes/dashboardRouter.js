import { Router } from 'express';
import whiteList from '../config/whiteList.js';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import formaterNameDashboard from '../utils/formaterDashboardName.js'
import convertTypeToBsonType from '../utils/convertTypeToBsonType.js'

import CollectionService from '../services/CollectionService.js';
import ValueService from '../services/ValueService.js';
import DashboardController from '../controllers/dashboardController.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const collectionService = new CollectionService(mongoInstance.client, whiteList);
const valueService = new ValueService(mongoInstance.client, convertTypeToBsonType);

const dashboardController = new DashboardController(
  mongoDbValidation,
  collectionService,
  valueService,
  formaterNameDashboard);

const routes = new Router();
routes.get('/',
  login.loginRequire.bind(login),
  historic,
  dashboardController.index.bind(dashboardController));
routes.get('/:dashboardName',
  login.loginRequire.bind(login),
  historic,
  dashboardController.show.bind(dashboardController));
routes.post('/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  dashboardController.store.bind(dashboardController));
routes.put('/',
  login.loginRequire.bind(login),
  permission('edit'),
  historic,
  dashboardController.update.bind(dashboardController));
routes.delete('/',
  login.loginRequire.bind(login),
  permission('delet'),
  historic,
  dashboardController.delete.bind(dashboardController));

export default routes;
