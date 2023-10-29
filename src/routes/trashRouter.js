import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import TrashController from '../controllers/trashController';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, historic, TrashController.show);
routes.get('/:limit?', loginRequire, historic, TrashController.index);
routes.put('/:id/:collectionName', loginRequire, permission('edit'), historic, TrashController.restore);
export default routes;
