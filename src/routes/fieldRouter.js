import { Router } from 'express';

import historic from '../middlewares/historic';
import permission from '../middlewares/permission';
import Login from '../middlewares/Login';

import FieldController from '../controllers/fieldController';

import FieldService from '../services/fieldService';
import FieldsConfigService from '../services/FieldsconfigSevice';
import convertTypeToBsonType from '../services/convertTypeToBsonType';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance } from '../database';
import whiteList from '../config/whiteList';

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
