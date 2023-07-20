import dotenv from 'dotenv';
import MongoDb from '../database/mongoDb';
import Permission from '../models/PermissionsModel';

dotenv.config();

class TableController {
  // table
  async store(req, res) {
    const existPermission = await Permission.checksPermission(req.userId, 'insert');

    if (!existPermission) throw new Error('Este usuario não possui a permissao necessarias');

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

      await database.createCollection(collectionName);

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

    try {
      await mongoDb.existDb(req.company);

      const response = [];
      const database = connection.db(mongoDb.database);

      const collections = (await database.listCollections().toArray()).map((cl) => cl.name);

      for (const collectionName of collections) {
        const collection = database.collection(collectionName);

        const rule = await collection.options();
        let fields = [];

        if (Object.keys(rule).length > 0) {
          const { properties } = rule.validator.$jsonSchema;

          fields = (Object.entries(properties)).reduce((accumulator, field) => {
            const objFields = {};
            [objFields.key] = field;
            objFields.type = field[1].bsonType;
            accumulator.push(objFields);
            return accumulator;
          }, []);
        }

        const obj = { collectionName, fields };
        response.push(obj);
      }

      if (response.length <= 0) throw new Error('Não há tabelas criadas');

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
    const existPermission = await Permission.checksPermission(req.userId, 'delet');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }
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

      if (!await mongoDb.existCollection(collectionName)) {
        throw new Error('Essa collection não existe');
      }

      const database = client.db(req.company);
      await database.dropCollection(collectionName);

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
    const existPermission = await Permission.checksPermission(req.userId, 'edit');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }
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

      if (!await mongoDb.existCollection(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }

      const database = client.db(req.company);
      const collection = database.collection(collectionName);

      await collection.rename(newName);

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
