// Em teste inda
import dotenv from 'dotenv';
import xlsx from 'xlsx';
import path from 'path';
import MongoDb from '../database/mongoDb';
import FieldsConfig from '../services/fieldsconfigSevice';

dotenv.config();

class DownloadController {
  async store(req, res, next) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    const fieldConfig = new FieldsConfig(mongoDb);
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

      const fields = await fieldConfig.listFields(req.company, collectionName);
      const values = (await collection.find({})
        .project(projection)
        .toArray())
        .map((doc) => {
          const docFormated = Object.entries(doc).reduce((ac, entrie) => {
            const originalKey = entrie[0];
            const infoCurrentField = fields.find((field) => field.originalName === originalKey);
            const { currentName } = infoCurrentField;
            const value = entrie[1];
            const newDoc = { ...ac, [currentName]: value };

            return newDoc;
          }, {});
          return docFormated;
        }, []);

      const fileName = `${req.company}_${collectionName}_${Date.now()}.xlsx`;
      const filePath = path.resolve(__dirname, '..', '..', 'uploads', fileName);

      const ws = xlsx.utils.json_to_sheet(values);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, `${req.company}_${collectionName}`);

      xlsx.writeFile(wb, filePath, { compression: true });

      res.status(200).json({
        filePath,
        fileName,
        url: `https://apiweon.nowecompany.com.br/${fileName}`,
      });

      req.filePath = filePath;
      await req.historic.registerChange(client);
      next();
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async index(req, res, next) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    const fieldConfig = new FieldsConfig(mongoDb);
    try {
      const { collectionName } = req.params;

      if (!collectionName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const collectionExist = await mongoDb.existCollection(collectionName);

      if (!collectionExist) {
        return res.status(400).json({
          errors: `A predefinição ${collectionName} não existe`,
        });
      }

      const listOfFields = await fieldConfig.listFields(req.company, collectionName);
      const fields = listOfFields.reduce((ac, fieldInf) => {
        const { currentName } = fieldInf;
        ac.push(currentName);

        return ac;
      }, []);
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet([]);
      xlsx.utils.sheet_add_aoa(ws, [fields], { origin: 'A1' });

      const fileName = `${req.company}_${collectionName}_${Date.now()}.xlsx`;
      const filePath = path.resolve(__dirname, '..', '..', 'uploads', fileName);

      xlsx.utils.book_append_sheet(wb, ws, `${req.company}_${collectionName}`);

      xlsx.writeFile(wb, filePath);

      res.status(200).json({
        filePath,
        fileName,
        url: `https://apiweon.nowecompany.com.br/${fileName}`,
      });

      req.filePath = filePath;
      await req.historic.registerChange(client);
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new DownloadController();
