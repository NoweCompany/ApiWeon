import { Router } from 'express';

import userController from '../controllers/userController';
import permissionsController from '../controllers/permissionsController';
import companyController from '../controllers/companyController';

import permission from '../middlewares/permission';
import loginRequire from '../middlewares/loginRequire';

const routes = new Router();

routes.get('/', loginRequire, userController.index);
routes.post('/', loginRequire, permission('insert'), userController.store);
routes.put('/', loginRequire, permission('edit'), userController.update);
routes.delete('/:id', loginRequire, permission('adm'), userController.delete);

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
