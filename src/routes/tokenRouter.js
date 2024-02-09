import { Router } from 'express';

import TokenController from '../controllers/tokenController';
import TokenService from '../services/TokenService';

import User from '../models/UserModels';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance } from '../database';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);

const routes = new Router();

const tokenServive = new TokenService(User, mongoDbValidation);
const tokenController = new TokenController(tokenServive);

routes.post('/', tokenController.store.bind(tokenController));
routes.post('/logado', tokenController.logado.bind(tokenController));

export default routes;
