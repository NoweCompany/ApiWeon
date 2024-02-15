import { Router } from 'express';

import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import CollectionService from '../services/CollectionService.js';
import TrashService from '../services/TrashService.js';

import TrashController from '../controllers/trashController.js';

import convertTypeToBsonType from '../utils/convertTypeToBsonType.js';

import whiteList from '../config/whiteList.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const trashService = new TrashService(mongoInstance.client, convertTypeToBsonType);
const collectionService = new CollectionService(mongoInstance.client, whiteList);
const trashController = new TrashController(mongoDbValidation, trashService, collectionService);

const routes = new Router();

routes.get(
  '/:collectionName/:limit?',
  login.loginRequire.bind(login),
  historic,
  trashController.show.bind(trashController),
);
routes.get(
  '/:limit?',
  login.loginRequire.bind(login),
  historic,
  trashController.index.bind(trashController),
);
routes.put(
  '/:id/:collectionName',
  login.loginRequire.bind(login),
  permission('adm'),
  historic,
  trashController.restore.bind(trashController),
);
export default routes;
