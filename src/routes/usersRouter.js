import { Router } from 'express';

import UserController from '../controllers/UserController.js';
import permissionsController from '../controllers/permissionsController.js';
import companyController from '../controllers/companyController.js';

import UserSevice from '../services/UserService.js';

import permission from '../middlewares/permission.js';
import Login from '../middlewares/Login.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance, sequelizeInstance } from '../database/index.js';

import User from '../models/UserModels.js';
import Company from '../models/CompanysModel.js';
import Permission from '../models/PermissionsModel.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);
const login = new Login(mongoDbValidation);

const userService = new UserSevice(sequelizeInstance.connection, User, Company, Permission);
const userController = new UserController(userService);

const routes = new Router();

routes.get(
  '/',
  login.loginRequire.bind(login),
  userController.index.bind(userController),
);
// routes.get(
//   '/:id',
//   login.loginRequire.bind(login),
//   userController.show.bind(userController),
// );
routes.post(
  '/',
  login.loginRequire.bind(login),
  permission('adm'),
  userController.store.bind(userController),
);
routes.put(
  '/',
  login.loginRequire.bind(login),
  permission('adm'),
  userController.update.bind(userController),
);
routes.delete(
  '/:id',
  login.loginRequire.bind(login),
  permission('adm'),
  userController.delete.bind(userController),
);

// rotas de permissões
// routes.get('/permission', permissionsController.index);
// routes.get('/:userId/permission', permissionsController.show);
routes.post('/:userId/permission', permissionsController.store);
routes.put('/:userId/permission', permissionsController.update);
// // routes.delete('/:userId/permission', permissionsController.delete);

// rotas de company
// routes.get('/company', companyController.index);
// routes.post('/:company_user_id/company', companyController.store);
routes.put('/:company_user_id/company', companyController.update);
routes.delete('/:company_user_id/company', companyController.delete);

export default routes;
