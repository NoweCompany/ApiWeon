import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import permission from '../middlewares/permission.js';
import historic from '../middlewares/historic.js';
import kpiController from '../controllers/kpiController.js';

const routes = new Router();
routes.post('/', loginRequire, permission('insert'), historic, kpiController.store);

export default routes;
