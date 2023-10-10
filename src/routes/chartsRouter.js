import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import chartsController from '../controllers/chartsController';

const routes = new Router();
routes.post('/', loginRequire, permission('insert'), chartsController.store);

export default routes;
