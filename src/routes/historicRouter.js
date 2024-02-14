import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import permission from '../middlewares/permission.js';

import historicController from '../controllers/historicController.js';

const routes = new Router();
routes.get('/', loginRequire, historicController.index);
routes.get('/:id', loginRequire, historicController.show);
routes.delete('/:id', loginRequire, permission('delet'), historicController.delete);

export default routes;
