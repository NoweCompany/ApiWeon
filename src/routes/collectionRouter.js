import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import collectionController from '../controllers/collectionController';

const routes = new Router();
routes.get('/', loginRequire, historic, collectionController.index);
routes.post('/', loginRequire, permission('insert'), historic, collectionController.store);
routes.put('/', loginRequire, permission('edit'), historic, collectionController.update);
routes.delete('/', loginRequire, permission('delet'), historic, collectionController.delete);

export default routes;
