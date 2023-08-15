import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import TrashController from '../controllers/trashController';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, TrashController.show);
routes.get('/:limit?', loginRequire, TrashController.index);
routes.put('/:id/:collectionName', loginRequire, permission('edit'), TrashController.restore);
export default routes;
