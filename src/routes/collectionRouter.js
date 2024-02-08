import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import MongoDbValidation from '../database/MongoValidation';
import { mongoInstance } from '../database';

import CollectionService from '../services/CollectionService';
import CollectionController from '../controllers/collectionController';

const mongoDbValidation = new MongoDbValidation();
const collectionService = new CollectionService(mongoInstance.client, mongoDbValidation);
const collectionController = new CollectionController(collectionService);

const routes = new Router();
// routes.get('/', loginRequire, historic, collectionController.index);
routes.post('/', loginRequire, permission('insert'), historic, collectionController.store.bind(collectionController));
// routes.put('/', loginRequire, permission('edit'), historic, collectionController.update);
// routes.delete('/', loginRequire, permission('delet'), historic, collectionController.delete);

export default routes;
