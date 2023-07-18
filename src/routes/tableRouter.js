import { Router } from 'express';
import loginRequire from '../middlewares/loginRequire';
import tableController from '../controllers/tableController';

const routes = new Router();

routes.get('/', loginRequire, tableController.index);
routes.post('/', loginRequire, tableController.store);
routes.put('/', loginRequire, tableController.update);
routes.delete('/', loginRequire, tableController.delete);

export default routes;
