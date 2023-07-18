import { Router } from 'express';
import multer from 'multer';

import loginRequire from '../middlewares/loginRequire';
import multerConfig from '../config/multerConfig';
import createSheet from '../middlewares/createSheet';
import downloadController from '../controllers/downloadController';

const routes = new Router();

routes.post('/:collectionName', loginRequire, downloadController.store);

routes.get('/teste', (req, res) => {
  console.log(Object.keys(req));
  res.json('ola mundo');
});
export default routes;
