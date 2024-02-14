import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import downloadController from '../controllers/downloadController.js';
import historic from '../middlewares/historic.js';
import removeFilePath from '../middlewares/removeFilePath.js';

import permission from '../middlewares/permission.js';

const routes = new Router();

routes.post('/:collectionName', loginRequire, permission('insert'), historic, downloadController.store, removeFilePath);
routes.get('/:collectionName', loginRequire, permission('insert'), historic, downloadController.index, removeFilePath);

export default routes;
