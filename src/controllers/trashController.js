import { ObjectId } from 'mongodb';
import MongoDb from '../database/mongoDb';
import whiteList from '../config/whiteList';

class TrashController {
  async index(req, res) {
    const limit = req.params.limit || 100;

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);

      const database = client.db(req.company);
      const collections = (await database.listCollections().toArray()).reduce((ac, vl) => {
        if (vl.name.includes('dashboard_') || whiteList.collections.includes(vl.name)) {
          return ac;
        }
        ac.push(vl);
        return ac;
      }, []);

      const valuesOnTrash = await collections.reduce(async (acPromise, collection) => {
        const ac = await acPromise;
        const values = (await database.collection(collection.name).find({ active: false }).limit(Number(limit)).toArray());

        const removeFieldDefault = values.map((value) => {
          if (value.active) return;
          const { default: defaultValue, active, ...rest } = value;
          return rest;
        });

        const exitObj = { collectionName: collection.name, values: removeFieldDefault };
        ac.push(exitObj);
        return ac;
      }, Promise.resolve([]));

      await req.historic.registerChange(client);
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

      await req.historic.registerChange(client);
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

      await req.historic.registerChange(client);
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
