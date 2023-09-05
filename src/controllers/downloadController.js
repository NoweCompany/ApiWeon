// Em teste inda
import dotenv from 'dotenv';
import fs from 'fs';
import json2xls from 'json2xls';
import path from 'path';
import MongoDb from '../database/mongoDb';

dotenv.config();

class DownloadController {
  async store(req, res, next) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      const existDb = await mongoDb.existDb(req.company);

      if (!existDb) {
        return res.status(400).json({
          errors: 'O bancos de dados q ue vc esta tentando acessar não existe',
        });
      }

      const { collectionName } = req.params;
      const collectionExist = await mongoDb.existCollection(collectionName);

      if (!collectionName || !collectionExist) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const database = client.db(req.company);
      const collection = database.collection(collectionName);
      const projection = { _id: false, default: false, active: false };
      const values = await collection.find({}).project(projection).toArray();

      const xls = json2xls(values);

      const fileName = `${req.company}_${collectionName}.xlsx`;
      const filePath = path.resolve(__dirname, '..', '..', 'uploads', fileName);

      fs.writeFileSync(filePath, xls, 'binary');

      res.status(200).json({
        filePath,
        fileName,
        url: `https://apiweon.nowecompany.com.br/${fileName}`,
      });

      req.filePath = filePath;
      next();
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }
}

export default new DownloadController();
