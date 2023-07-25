import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import tableController from '../controllers/collectionController';

const routes = new Router();
routes.get('/', loginRequire, tableController.index);
routes.post('/', loginRequire, permission('insert'), tableController.store);
routes.put('/', loginRequire, permission('edit'), tableController.update);
routes.delete('/', loginRequire, permission('delet'), tableController.delete);

export default routes;
