import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import historicController from '../controllers/historicController';

const routes = new Router();
routes.get('/', loginRequire, historicController.index);
routes.get('/:id', loginRequire, historicController.show);
routes.delete('/:id', loginRequire, permission('delet'), historicController.delete);

export default routes;
