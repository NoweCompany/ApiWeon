import { ObjectId } from 'mongodb';
import MongoDb from '../database/mongoDb';

class TrashController {
  async index(req, res) {
    const limit = req.params.limit || 100;

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);

      const database = client.db(req.company);

      const collections = (await database.listCollections().toArray()).map((collection) => collection.name);

      const valuesOnTrash = collections.reduce(async (ac, collection) => {
        const values = await database.collection(collection).find({ active: false }).limit(Number(limit)).toArray();
        console.log(values);
        const removeFieldDefault = values.map((value) => {
          const { default: defaultValue, active, ...rest } = value;
          return rest;
        });
        console.log(removeFieldDefault);
        ac.push(removeFieldDefault);
        return ac;
      }, []);

      return res.status(200).json(valuesOnTrash);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async show(req, res) {
    const { collectionName } = req.params;
    const limit = req.params.limit || 100;

    if (!collectionName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);

      const database = client.db(req.company);

      if (!await mongoDb.existCollection(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }

      const collection = database.collection(collectionName);

      const values = await collection.find({ active: false }).limit(Number(limit)).toArray();
      const removeFieldDefault = values.map((value) => {
        const { default: defaultValue, active, ...rest } = value;
        return rest;
      });

      return res.status(200).json(removeFieldDefault);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async restore(req, res) {
    const { id, collectionName } = req.params;

    if (!collectionName || !id) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      const collection = client.db(req.company).collection(collectionName);
      const existValue = await collection.findOne({ _id: new ObjectId(id) });
      if (!existValue || existValue.active) {
        throw new Error(`O registro com o ID '${id}' está na lixeira '${collectionName}`);
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { active: true } },
      );

      return res.json({
        success: 'Restaurado com sucesso!',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new TrashController();
