import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import chartsController from '../controllers/chartsController.js';

const routes = new Router();
routes.post('/', loginRequire, permission('insert'), historic, chartsController.store);

export default routes;
