import { Router } from 'express';

import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';
import Login from '../middlewares/Login.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

import DownloadController from '../controllers/downloadController.js'
import FieldsConfig from '../services/fieldsconfigSevice.js';
import SheetService from '../services/SheetService.js';

const fieldsconfigSevice = new FieldsConfig(mongoInstance.client)
const sheetService = new SheetService(mongoInstance.client)
const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const downloadController = new DownloadController(sheetService, fieldsconfigSevice)

const routes = new Router();

routes.post('/:collectionName',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  downloadController.store.bind(downloadController)
);

routes.get('/:collectionName',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  downloadController.index.bind(downloadController)
);

export default routes;
