import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import valueController from '../controllers/valueController';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, historic, valueController.index);
routes.post('/', loginRequire, permission('insert'), historic, valueController.store);
routes.put('/:id/', loginRequire, permission('edit'), historic, valueController.update);
routes.delete('/:id/:collectionName/:permanent', loginRequire, permission('delet'), historic, valueController.delete);

export default routes;
