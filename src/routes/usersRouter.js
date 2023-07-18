import { Router } from 'express';

import userController from '../controllers/userController';
import permissionsController from '../controllers/permissionsController';
import companyController from '../controllers/companyController';

import loginRequire from '../middlewares/loginRequire';

const routes = new Router();

routes.get('/', userController.index);
routes.post('/', userController.store);
routes.put('/', loginRequire, userController.update);
routes.delete('/:id', userController.delete);

//rotas de permissões
routes.get('/permission', permissionsController.index);
routes.get('/:userId/permission', permissionsController.show);
routes.post('/:userId/permission', permissionsController.store);
routes.put('/:userId/permission', permissionsController.update);
//routes.delete('/:userId/permission', permissionsController.delete);

//rotas de company
routes.get('/company', companyController.index);
routes.post('/:company_user_id/company', companyController.store);
routes.put('/:company_user_id/company', companyController.update);
routes.delete('/:company_user_id/company', companyController.delete);

export default routes;
