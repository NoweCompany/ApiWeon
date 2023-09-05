import { Router } from 'express';

import loginRequire from '../middlewares/loginRequire';
import downloadController from '../controllers/downloadController';
import removeFilePath from '../middlewares/removeFilePath';

const routes = new Router();

routes.post('/:collectionName', loginRequire, downloadController.store, removeFilePath);

routes.get('/teste', (req, res) => {
  console.log(Object.keys(req));
  res.json('ola mundo');
});
export default routes;
