import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import kpiController from '../controllers/kpiController';

const routes = new Router();
routes.post('/', loginRequire, permission('insert'), kpiController.store);

export default routes;
