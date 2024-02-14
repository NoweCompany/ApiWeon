import { Router } from 'express';

import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';
import Login from '../middlewares/Login.js';

import FieldController from '../controllers/fieldController.js';

import FieldService from '../services/fieldService.js';
import FieldsConfigService from '../services/FieldsconfigSevice.js';
import convertTypeToBsonType from '../utils/convertTypeToBsonType.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';
import whiteList from '../config/whiteList.js';

const routes = new Router();

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const fieldsConfigService = new FieldsConfigService(mongoInstance.client);
const fieldService = new FieldService(mongoInstance.client, convertTypeToBsonType);
const fieldController = new FieldController(fieldService, fieldsConfigService, mongoDbValidation, whiteList);

routes.get(
  '/:collectionName',
  login.loginRequire.bind(login),
  historic,
  fieldController.index.bind(fieldController),
);
routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  fieldController.store.bind(fieldController),
);
routes.put(
  '/',
  login.loginRequire.bind(login),
  permission('edit'),
  historic,
  fieldController.update.bind(fieldController),
);
routes.delete(
  '/:collectionName/:fieldName/:originalName',
  login.loginRequire.bind(login),
  permission('delet'),
  historic,
  fieldController.delete.bind(fieldController),
);

export default routes;
