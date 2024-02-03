import dotenv from 'dotenv';
import MongoDb from '../database/mongoDb';
import whiteList from '../config/whiteList';
import FieldsConfigService from '../services/fieldsconfigSevice';

dotenv.config();

class TableController {
  // table
  async store(req, res) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);

      const { collectionName } = req.body;
      if (!collectionName) throw new Error('Envie os valores corretos');

      const collections = (await database.listCollections().toArray()).map((vl) => vl.name);

      if (collections.includes(collectionName)) {
        return res.status(400).json({
          errors: 'Essa predefinição já existe',
        });
      }

      await database.createCollection(collectionName, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            title: `${collectionName} rule`,
            required: ['default', 'active'],
            properties: {
              default: {
                bsonType: 'int',
                description: 'Campo padrão',
              },
              active: {
                bsonType: 'bool',
                description: 'Campo para verificar o estado do documento',
              },
            },
          },
        },
        validationLevel: 'moderate',
        validationAction: 'error',
      });

      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Predefinição criada com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
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

export default new TableController();
