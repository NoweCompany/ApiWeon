import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import dashboardController from '../controllers/dashboardController';

const routes = new Router();
routes.get('/', loginRequire, historic, dashboardController.index);
routes.get('/:dashboardName', loginRequire, historic, dashboardController.show);
routes.post('/', loginRequire, permission('insert'), historic, dashboardController.store);
routes.put('/', loginRequire, permission('edit'), historic, dashboardController.update);
routes.delete('/', loginRequire, permission('delet'), historic, dashboardController.delete);

export default routes;
