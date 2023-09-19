import { ObjectId } from 'mongodb';
import MongoDb from '../database/mongoDb';

async function getRules(dbName, collectionName, client) {
  const collection = client.db(dbName).collection(collectionName);

  const rule = await collection.options();
  let fields = [];

  if (Object.keys(rule).length <= 0) {
    throw new Error('Não há nenhum campo criado');
  }

  const { properties } = rule.validator.$jsonSchema;
  const { required } = rule.validator.$jsonSchema;

  fields = (Object.entries(properties)).reduce((accumulator, field) => {
    if (field[0] === 'default' || field[0] === 'active') return accumulator;
    const objFields = {};
    [objFields.key] = field;
    objFields.type = field[1].bsonType;
    objFields.required = !!(required.includes(field[0]));
    accumulator.push(objFields);
    return accumulator;
  }, []);

  return { collectionName, fields };
}

class DashboardController {
  async store(req, res) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      const {
        name, preset, textField, numberField, typeChart,
      } = req.body;
      if (!name || !preset || !textField || !numberField || !typeChart) throw new Error('Envie os valores corretos');

      if (!await mongoDb.existCollection(preset)) throw new Error('Essa predefinição não existe!');
      const rulesOfpreset = await getRules(req.company, preset, client);

      let textFieldExist = false;
      let numberFieldExist = false;
      for (let field of rulesOfpreset.fields) {
        const fieldName = field.key;
        const fieldType = field.type;

        if (fieldName === textField) textFieldExist = true;
        if (fieldName === numberField) numberFieldExist = true;

        if (fieldName === textField && fieldType !== 'string') {
          throw new Error('A propriedade textField deve ser um campo de tipo string');
        }
        if (fieldName === numberField && (fieldType !== 'int' && fieldType !== 'double')) {
          throw new Error('A propriedade numberField deve ser um campo de tipo double ou int');
        }
      }
      if (!textFieldExist || !numberFieldExist) {
        throw new Error('O campo selecionado não existem');
      }

      const exitCollectionDashboard = await mongoDb.existCollection('dashboard');
      if (!exitCollectionDashboard) {
        // Cria a colleção com suas validações
        const validationSchema = {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['name', 'preset', 'textField', 'numberField', 'typeChart'],
              properties: {
                name: {
                  bsonType: 'string',
                  description: 'Name of Dashboard',
                },
                preset: {
                  bsonType: 'string',
                  description: 'preset name ',
                },
                textField: {
                  bsonType: 'string',
                  description: 'Field type string',
                },
                numberField: {
                  bsonType: 'string',
                  description: 'Field type number',
                },
                typeChart: {
                  enum: ['pie', 'area', 'line', 'column'],
                  description: 'Types of charts allowed',
                },
              },
            },
          },
          validationLevel: 'strict',
          validationAction: 'error',
        };

        await client.db(req.company).createCollection('dashboard', validationSchema);
      }

      // insere os dados do body
      const dataBase = client.db(req.company);
      await dataBase.collection('dashboard').insertOne({
        name, preset, textField, numberField, typeChart,
      });

      return res.status(200).json(true);
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
    const client = await mongoDb.connect();
    try {
      const dataBase = client.db(req.company);
      const dashboards = await dataBase.collection('dashboard').find({}).toArray();

      return res.status(200).json(dashboards);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async show(req, res) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      const { id } = req.params;
      if (!id) throw new Error('Envie os valores corretos');
      const dataBase = client.db(req.company);
      const objectId = new ObjectId(id);
      const dashboard = await dataBase.collection('dashboard').findOne({ _id: objectId });

      return res.status(200).json(dashboard);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async update(req, res) {
    return res.json(true);
  }

  async delete(req, res) {
    return res.json(true);
  }
}

export default new DashboardController();
