import { Router } from 'express';
import templeteController from '../controllers/templateController';
import loginRequire from '../middlewares/loginRequire';

const routes = new Router();

//table
routes.post('/table', loginRequire, templeteController.storeTable);
routes.get('/table', loginRequire, templeteController.indexTables);
routes.delete('/table', loginRequire, templeteController.deleteTables);
routes.put('/table', loginRequire, templeteController.updateTables);

//fild
routes.get('/field/:tableName', loginRequire, templeteController.showField);
routes.post('/field', loginRequire, templeteController.storeField);
routes.put('/field', loginRequire, templeteController.updateField);
routes.delete('/field', loginRequire, templeteController.deleteField);

//valores
routes.post('/values', loginRequire, templeteController.storeValues);
routes.get('/values/:tableName', loginRequire, templeteController.indexValues);
routes.put('/:id/values', loginRequire, templeteController.updateValues);
routes.delete('/:id/values', loginRequire, templeteController.deleteValues);

export default routes;
