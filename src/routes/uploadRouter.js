import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import uploadController from '../controllers/uploadController';
import historic from '../middlewares/historic';

import permission from '../middlewares/permission';

const routes = new Router();

routes.post('/: /:fileExtName', loginRequire, permission('insert'), historic, uploadController.store);

export default routes;
