export default class DashboardController {
  constructor(mongoDbValidation, collectionService, valueService, formaterNameDashboard) {
    this.mongoDbValidation = mongoDbValidation
    this.collectionService = collectionService
    this.valueService = valueService
    this.formaterNameDashboard = formaterNameDashboard
  }
  async store(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({
          error: 'Envie os valores corretos!'
        });
      }
      const dataBaseName = req.company

      const nameFormater = this.formaterNameDashboard(name);
      const existCollection = await this.mongoDbValidation.existCollection(dataBaseName, nameFormater);
      if (existCollection) {
        return res.status(400).json({
          error: 'Já existe uma dashboard com esse nome',
        });
      }
      const schemaValidator = {
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

      await this.collectionService.createNewCollection(dataBaseName, nameFormater, schemaValidator)

      await req.historic.registerChange();
      return res.status(200).json(true);
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async show(req, res) {
    try {
      const dataBaseName = req.company
      const { dashboardName } = req.params;
      if (!dashboardName) {
        return res.status(400).json({
          error: 'Envie os valores corretos!'
        });
      }
      const nameFormater = this.formaterNameDashboard(dashboardName);
      const dashboards = await this.valueService.listAllDocuments(dataBaseName, nameFormater, Infinity);

      await req.historic.registerChange();
      return res.status(200).json(dashboards);
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    try {
      const dataBaseName = req.company;
      const condicion = (collectionName) => collectionName.startsWith('dashboard_');
      const dashboards = await this.collectionService.listCollectionsInDatabase(dataBaseName, condicion)
      const responseData = await this.valueService.listAllDocumentsInCollections(dataBaseName, dashboards, Infinity)

      await req.historic.registerChange();
      return res.status(200).json(responseData);
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    return res.json(true);
  }

  async delete(req, res) {
    return res.json(true);
  }
}


