import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import valueController from '../controllers/valueController';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, valueController.index);
routes.post('/', loginRequire, permission('insert'), valueController.store);
routes.put('/:id/', loginRequire, permission('edit'), valueController.update);
routes.delete('/:id/:collectionName/:permanent', loginRequire, permission('delet'), valueController.delete);

export default routes;
