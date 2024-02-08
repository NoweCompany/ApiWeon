import { Router } from 'express';

import TokenController from '../controllers/tokenController';
import TokenService from '../services/TokenService';

import User from '../models/UserModels';

const routes = new Router();

const tokenServive = new TokenService(User);
const tokenController = new TokenController(tokenServive);

routes.post('/', tokenController.store.bind(tokenController));
routes.post('/logado', tokenController.logado.bind(tokenController));

export default routes;
