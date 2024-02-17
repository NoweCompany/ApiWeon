import { Router } from 'express';


import Login from '../middlewares/Login.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js'

import UploadController from '../controllers/uploadController.js';

import { mongoInstance } from '../database/index.js';
import MongoDbValidation from '../database/MongoValidation.js';
import ValueService from '../services/ValueService.js';
import convertTypeToBsonType from '../utils/convertTypeToBsonType.js';
import FieldsConfig from '../services/FieldsconfigSevice.js';

const fieldsconfigSevice = new FieldsConfig(mongoInstance.client)

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const valueService = new ValueService(mongoInstance.client, convertTypeToBsonType)
const uploadController = new UploadController(fieldsconfigSevice, valueService)

const routes = new Router();

routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('insert'),
  historic,
  uploadController.store.bind(uploadController)
);

export default routes;
