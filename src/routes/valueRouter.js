import { Router } from 'express';
import loginRequire from '../middlewares/loginRequire';
import valueController from '../controllers/valueController';

const routes = new Router();

routes.get('/:collectionName/:limit?', loginRequire, valueController.index);
routes.post('/', loginRequire, valueController.store);
routes.put('/:id/', loginRequire, valueController.update);
routes.delete('/:id/:collectionName', loginRequire, valueController.delete);

export default routes;
