import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire.js';
import uploadController from '../controllers/uploadController.js';
import historic from '../middlewares/historic.js';

import permission from '../middlewares/permission.js';

const routes = new Router();

routes.post('/', loginRequire, permission('insert'), historic, uploadController.store);

export default routes;
