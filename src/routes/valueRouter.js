import { Router } from 'express';

import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';
import Login from '../middlewares/Login.js';

import whiteList from '../config/whiteList.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import ValueService from '../services/ValueService.js';
import ValueController from '../controllers/valueController.js';
import convertTypeToBsonType from '../utils/convertTypeToBsonType.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const valueService = new ValueService(mongoInstance.client, convertTypeToBsonType);
const valueController = new ValueController(valueService, mongoDbValidation, whiteList);

const routes = new Router();

routes.get(
  '/:collectionName/:limit?',
  login.loginRequire.bind(login),
  historic,
  valueController.index.bind(valueController),
);
routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  valueController.store.bind(valueController),
);
routes.put(
  '/:id/',
  login.loginRequire.bind(login),
  permission('edit'),
  historic,
  valueController.update.bind(valueController),
);
routes.delete(
  '/:collectionName/:permanent',
  login.loginRequire.bind(login),
  permission('delet'),
  historic,
  valueController.delete.bind(valueController),
);

export default routes;
