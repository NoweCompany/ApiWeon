import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import permission from '../middlewares/permission';

import fieldController from '../controllers/fieldController';

const routes = new Router();

routes.get('/:collectionName', loginRequire, fieldController.index);
routes.post('/', loginRequire, permission('insert'), fieldController.store);
routes.put('/', loginRequire, permission('edit'), fieldController.update);
routes.delete('/:collectionName/:fieldName', loginRequire, permission('delet'), fieldController.delete);

export default routes;
