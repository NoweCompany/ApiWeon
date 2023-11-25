import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import downloadController from '../controllers/downloadController';
import historic from '../middlewares/historic';
import removeFilePath from '../middlewares/removeFilePath';

import permission from '../middlewares/permission';

const routes = new Router();

routes.post('/:collectionName', loginRequire, permission('insert'), historic, downloadController.store, removeFilePath);
routes.get('/:collectionName', loginRequire, permission('insert'), historic, downloadController.index, removeFilePath);

export default routes;
