import { Router } from 'express';

import historic from '../middlewares/historic';
import permission from '../middlewares/permission';
import Login from '../middlewares/Login';

import whiteList from '../config/whiteList';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance } from '../database';

import ValueService from '../services/ValueService';
import ValueController from '../controllers/valueController';
import convertTypeToBsonType from '../services/convertTypeToBsonType';

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
  '/:id/:collectionName/:permanent',
  login.loginRequire.bind(login),
  permission('delet'),
  historic,
  valueController.delete.bind(valueController),
);

export default routes;
