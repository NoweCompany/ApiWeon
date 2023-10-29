import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import fieldController from '../controllers/fieldController';

const routes = new Router();

routes.get('/:collectionName', loginRequire, historic, fieldController.index);
routes.post('/', loginRequire, permission('insert'), historic, fieldController.store);
routes.put('/', loginRequire, permission('edit'), historic, fieldController.update);
routes.delete('/:collectionName/:fieldName', loginRequire, permission('delet'), historic, fieldController.delete);

export default routes;
