import MongoDb from '../database/mongoDb';

function formaterNameDashboard(name) {
  return `dashboard_${(name.toLowerCase().trim()).split(' ').join('_')}`;
}
class DashboardController {
  async store(req, res) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      const { name } = req.body;
      if (!name) {
        throw new Error('Envie os valores corretos');
      }

      const nameFormater = formaterNameDashboard(name);

      const exitCollectionDashboard = await mongoDb.existCollection(nameFormater);
      if (exitCollectionDashboard) {
        throw new Error(`O dashboard ${name} já existe`);
      }
      // Cria a colleção com suas validações
      const validationSchema = {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'preset'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Name of Dashboard',
              },
              preset: {
                bsonType: 'string',
                description: 'preset name ',
              },
            },
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      };

      await client.db(req.company).createCollection(nameFormater, validationSchema);
      await req.historic.registerChange(client);
      return res.status(200).json(true);
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
      const dataBase = client.db(req.company);

      const { dashboardName } = req.params;
      if (!dashboardName) {
        throw new Error('Envie os valores corretos');
      }
      const nameFormater = formaterNameDashboard(dashboardName);
      const exitCollectionDashboard = await mongoDb.existCollection(nameFormater);
      if (!exitCollectionDashboard) {
        throw new Error(`O dashboard ${dashboardName} não existe`);
      }

      const dashboards = await dataBase.collection(nameFormater).find().toArray();
      await req.historic.registerChange(client);

      return res.status(200).json(dashboards);
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
      const query = { name: { $regex: /dashboard/, $options: 'i' } };
      const dashboards = (await dataBase.listCollections(query).toArray()).map((collection) => collection.name);

      const responseData = [];
      for (const cl of dashboards) {
        const data = {
          name: cl,
          values: await dataBase.collection(cl).find().toArray(),
        };

        responseData.push(data);
      }

      await req.historic.registerChange(client);
      return res.status(200).json(responseData);
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
