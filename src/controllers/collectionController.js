import dotenv from 'dotenv';
import MongoDb from '../database/MongoDbConnection';
import whiteList from '../config/whiteList';
import FieldsConfigService from '../services/fieldsconfigSevice';

dotenv.config();

class CollectionController {
  constructor(collectionService) {
    this.collectionService = collectionService;
  }

  // table
  async store(req, res) {
    try {
      const { collectionName } = req.body;
      const dataBaseName = req.company;

      const createdCollection = await this.collectionService.createNewCollection(dataBaseName, collectionName);

      const { status, msg } = createdCollection;

      await req.historic.registerChange();

      return res.status(status).json(msg);
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    const mongoDb = new MongoDb(req.company);
    const connection = await mongoDb.connect();
    const fieldConfig = new FieldsConfigService(mongoDb);

    try {
      await mongoDb.existDb(req.company);

      const response = [];
      const database = connection.db(mongoDb.database);
      const collections = (await database.listCollections().toArray()).reduce((ac, vl) => {
        if (vl.name.includes('dashboard_') || whiteList.collections.includes(vl.name)) {
          return ac;
        }
        ac.push(vl.name);
        return ac;
      }, []);

      for (const collectionName of collections) {
        const fields = await fieldConfig.listFields(req.company, collectionName);

        const obj = { collectionName, fields };
        response.push(obj);
      }

      await req.historic.registerChange(connection);
      if (response.length <= 0) return res.status(200).json('Não há tabelas criadas');

      return res.status(200).json({ response });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async delete(req, res) {
    const { collectionName } = req.body;

    if (!collectionName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);

      if (!await mongoDb.existCollection(collectionName) || whiteList.collections.includes(collectionName)) {
        throw new Error('Essa collection não existe');
      }

      const database = client.db(req.company);
      await database.dropCollection(collectionName);
      await database.collection('FieldsConfig').deleteMany({
        collectionName,
      });
      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Sua predefinição foi excluida com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async update(req, res) {
    const { collectionName, newName } = req.body;

    if (!collectionName || !newName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);

      if (!await mongoDb.existCollection(collectionName) || whiteList.collections.includes(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }

      const database = client.db(req.company);
      const collection = database.collection(collectionName);

      await collection.rename(newName);
      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Tabela renomeada com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default CollectionController;
