import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import dashboardController from '../controllers/dashboardController';

const routes = new Router();
routes.get('/', loginRequire, dashboardController.index);
routes.post('/', loginRequire, permission('insert'), dashboardController.store);
routes.put('/', loginRequire, permission('edit'), dashboardController.update);
routes.delete('/', loginRequire, permission('delet'), dashboardController.delete);

export default routes;
