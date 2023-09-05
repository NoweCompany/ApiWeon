import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import downloadController from '../controllers/downloadController';
import removeFilePath from '../middlewares/removeFilePath';

import permission from '../middlewares/permission';

const routes = new Router();

routes.post('/:collectionName', loginRequire, permission('insert'), downloadController.store, removeFilePath);

export default routes;
