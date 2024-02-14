import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import historic from '../middlewares/historic.js';
import permission from '../middlewares/permission.js';

import TrashController from '../controllers/trashController.js';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, historic, TrashController.show);
routes.get('/:limit?', loginRequire, historic, TrashController.index);
routes.put('/:id/:collectionName', loginRequire, permission('edit'), historic, TrashController.restore);
export default routes;
