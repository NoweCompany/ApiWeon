import { Router } from 'express';

import UserController from '../controllers/userController';
import permissionsController from '../controllers/permissionsController';
import companyController from '../controllers/companyController';

import UserSevice from '../services/UserService';

import permission from '../middlewares/permission';
import Login from '../middlewares/Login';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance, sequelizeInstance } from '../database';

import User from '../models/UserModels';
import Company from '../models/CompanysModel';
import Permission from '../models/PermissionsModel';

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
