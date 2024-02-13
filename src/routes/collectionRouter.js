import { Router } from 'express';
import whiteList from '../config/whiteList';

import Login from '../middlewares/Login';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance } from '../database';

import CollectionService from '../services/CollectionService';
import FieldsConfigService from '../services/fieldsconfigSevice';

import CollectionController from '../controllers/collectionController';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const fieldsConfigService = new FieldsConfigService(mongoInstance.client);
const collectionService = new CollectionService(mongoInstance.client, mongoDbValidation, whiteList);

const collectionController = new CollectionController(collectionService, fieldsConfigService);

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
  permission('insert'),
  historic,
  collectionController.store.bind(collectionController),
);
routes.put(
  '/',
  login.loginRequire.bind(login),
  permission('edit'),
  historic,
  collectionController.update.bind(collectionController),
);
routes.delete(
  '/',
  login.loginRequire.bind(login),
  permission('delet'),
  historic,
  collectionController.delete.bind(collectionController),
);

export default routes;
