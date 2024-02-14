import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import dashboardController from '../controllers/dashboardController.js';

const routes = new Router();
routes.get('/', loginRequire, historic, dashboardController.index);
routes.get('/:dashboardName', loginRequire, historic, dashboardController.show);
routes.post('/', loginRequire, permission('insert'), historic, dashboardController.store);
routes.put('/', loginRequire, permission('edit'), historic, dashboardController.update);
routes.delete('/', loginRequire, permission('delet'), historic, dashboardController.delete);

export default routes;
