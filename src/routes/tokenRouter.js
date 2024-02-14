import { Router } from 'express';

import TokenController from '../controllers/tokenController.js';
import TokenService from '../services/TokenService.js';

import User from '../models/UserModels.js';

import MongoDbValidation from '../database/MongoValidation.js';
import { mongoInstance } from '../database/index.js';

const mongoDbValidation = new MongoDbValidation(mongoInstance.client);

const routes = new Router();

const tokenServive = new TokenService(User, mongoDbValidation);
const tokenController = new TokenController(tokenServive);

routes.post('/', tokenController.store.bind(tokenController));
routes.post('/logado', tokenController.logado.bind(tokenController));

export default routes;
