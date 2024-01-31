import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import historic from '../middlewares/historic';
import permission from '../middlewares/permission';

import FieldController from '../controllers/fieldController';

import FieldService from '../services/fieldService';
import FieldsconfigSevice from '../services/fieldsconfigSevice';
import convertTypeToBsonType from '../services/convertTypeToBsonType';

import MongoDb from '../database/mongoDb';

const routes = new Router();

const mongoDb = new MongoDb();

const fieldsconfigSevice = new FieldsconfigSevice(mongoDb);
const fieldService = new FieldService(mongoDb, convertTypeToBsonType, fieldsconfigSevice);
const fieldController = new FieldController(fieldService, mongoDb);

routes.get('/:collectionName', loginRequire, historic, fieldController.index.bind(fieldController));
routes.post('/', loginRequire, permission('insert'), historic, fieldController.store.bind(fieldController));
routes.put('/', loginRequire, permission('edit'), historic, fieldController.update.bind(fieldController));
routes.delete('/:collectionName/:fieldName/:originalName', loginRequire, permission('delet'), historic, fieldController.delete.bind(fieldController));

export default routes;
