import dotenv from 'dotenv';
import fs from 'fs';
import json2xls from 'json2xls';
import path from 'path';
import MongoDb from '../database/mongoDb';
import Permission from '../models/PermissionsModel';

dotenv.config();

class DownloadController {
  async store(req, res) {
    const existPermission = await Permission.checksPermission(req.userId, 'insert');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }

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
      const collectionExist = await mongoDb.collectionExist(collectionName);

      if (!collectionName || !collectionExist) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const database = client.db(req.company);
      const collection = database.collection(collectionName);
      const values = await collection.find({}).toArray();
      const valuesJson = JSON.stringify(values);

      const xls = json2xls(values);

      const fileName = `${req.company}_${collectionName}.xlsx`;
      const filePath = path.resolve(__dirname, '..', '..', 'uploads', fileName);

      fs.writeFileSync(filePath, xls, 'binary');

      return res.status(200).json(xls);
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }
}

export default new DownloadController();
