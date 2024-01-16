import {
  ObjectId, Long, Double, Int32,
} from 'mongodb';
import MongoDb from '../database/mongoDb';

class ValueController {
  async store(req, res) {
    const { collectionName, values } = req.body;

    if (!collectionName || !values || values.length <= 0) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      if (!await mongoDb.existDb(req.company)) throw new Error('O banco de dados que está tentando acessar não existe');

      const database = client.db(req.company);
      const collection = database.collection(collectionName);

      const rules = await collection.options();
      const { properties } = rules.validator.$jsonSchema;

      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        value.default = 0;
        value.active = true;
        if (Object.keys(value).length <= 0) {
          throw new Error('Valores inválidos');
        }
        for (const entriesOfValue of Object.entries(value)) {
          const keyOfDocument = entriesOfValue[0];
          const valueOfDocument = entriesOfValue[1];
          const typeOfkeyValue = properties[keyOfDocument]?.bsonType;

          if (!typeOfkeyValue) throw new Error('Valores inválidos');
          switch (typeOfkeyValue) {
            case 'long':
              if (BigInt(valueOfDocument) > Number.MAX_SAFE_INTEGER) throw new Error(`Valores inválidos, o número enviado ultrapassa o valor máximo de ${Number.MAX_SAFE_INTEGER} caracteres`);
              value[keyOfDocument] = Long.fromBigInt(BigInt(req.body.values[i][keyOfDocument]));
              break;
            case 'date':
              value[keyOfDocument] = new Date(valueOfDocument);
              break;
            case 'double':
              value[keyOfDocument] = new Double(valueOfDocument);
              break;
            case 'int':
              value[keyOfDocument] = new Int32(valueOfDocument);
              break;
            default:
              value[keyOfDocument] = valueOfDocument;
          }
        }
      }
      await collection.insertMany(values);
      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Cadastro bem sucedido',
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
    const { collectionName } = req.params;
    const limit = req.params.limit || Infinity;

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

      let values = await collection.find({ active: true }).limit(Number(limit)).toArray();
      values = values.map((doc) => {
        let newDoc = { ...doc };
        for (let key in newDoc) {
          if (newDoc[key] instanceof Long) {
            newDoc[key] = Number(newDoc[key]).toString();
          }
        }

        const { default: defaultValue, active, ...rest } = newDoc;
        return rest;
      });

      await req.historic.registerChange(client);
      return res.status(200).json(values);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async delete(req, res) {
    const { id, collectionName } = req.params;
    const permanent = req.params.permanent === 'true';

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
      if (!existValue || (!existValue.active && !permanent)) {
        throw new Error(`O registro com o ID '${id}' não está ativo na predefinição '${collectionName}`);
      }

      if (permanent) {
        await collection.deleteOne({ _id: new ObjectId(id) });
        return res.json({
          success: 'Deletado com sucesso.',
        });
      }
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: { active: false } });
      await req.historic.registerChange(client);

      return res.json({
        success: 'Movido para lixeira.',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { collectionName, values } = req.body;

    if (!collectionName || !values || !id) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      const collection = client.db(req.company).collection(collectionName);

      if (!await mongoDb.existValue(id, collectionName)) {
        throw new Error(`O registro com o ID '${id}' não existe na tabela '${collectionName}`);
      }

      Object.keys(values).forEach((field) => {
        if (field === 'default') throw new Error('Esse campo não exite');
      });

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: values },
      );

      await req.historic.registerChange(client);

      return res.json({
        success: 'alterado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new ValueController();
