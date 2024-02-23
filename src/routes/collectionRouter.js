import { Router } from 'express';
import whiteList from '../config/whiteList.js';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import CollectionService from '../services/CollectionService.js';
import FieldsConfigService from '../services/fieldsconfigSevice.js';

import CollectionController from '../controllers/collectionController.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const fieldsConfigService = new FieldsConfigService(mongoInstance.client);
const collectionService = new CollectionService(mongoInstance.client, whiteList);

const collectionController = new CollectionController(mongoDbValidation, collectionService, fieldsConfigService);

const routes = new Router();
routes.get(
  '/',
  login.loginRequire.bind(login),
  historic,
  collectionController.index.bind(collectionController),
);
routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('adm'),
  historic,
  collectionController.store.bind(collectionController),
);
routes.put(
  '/',
  login.loginRequire.bind(login),
  permission('adm'),
  historic,
  collectionController.update.bind(collectionController),
);
routes.delete(
  '/',
  login.loginRequire.bind(login),
  permission('adm'),
  historic,
  collectionController.delete.bind(collectionController),
);

export default routes;
