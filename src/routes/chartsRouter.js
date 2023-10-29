import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import chartsController from '../controllers/chartsController';

const routes = new Router();
routes.post('/', loginRequire, permission('insert'), historic, chartsController.store);

export default routes;
