import { Router } from 'express';
import tokenController from '../controllers/tokenController';

const routes = new Router();

routes.post('/', tokenController.store);
routes.post('/logado', tokenController.logado);

export default routes;
