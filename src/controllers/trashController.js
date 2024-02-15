export default class TrashController {
  constructor(mongoDbValidation, trashService, collectionService) {
    this.mongoDbValidation = mongoDbValidation;
    this.trashService = trashService;
    this.collectionService = collectionService;
  }

  async index(req, res) {
    try {
      const limit = req.params.limit || 100;
      const databaseName = req.company;

      const collections = await this.collectionService.listCollectionsInDatabase(databaseName);
      const valuesOnTrash = await this.trashService.listItemsAllTrash(databaseName, collections, limit);

      await req.historic.registerChange();
      return res.status(200).json(valuesOnTrash);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async show(req, res) {
    try {
      const { collectionName } = req.params;
      const limit = req.params.limit || 100;

      if (!collectionName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const databaseName = req.company;
      const existCollection = await this.mongoDbValidation.existCollection(databaseName, collectionName);
      if (!existCollection) {
        return res.status(400).json({
          error: 'Não existe nenhuma predefinição com esse nome',
        });
      }

      const listItemsInTrash = await this.trashService.listItemsInTrash(databaseName, collectionName, limit);

      await req.historic.registerChange();
      return res.status(200).json(listItemsInTrash);
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async restore(req, res) {
    try {
      const { id, collectionName } = req.params;

      if (!collectionName || !id) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }
      const databaseName = req.company;
      const existCollection = await this.mongoDbValidation.existCollection(databaseName, collectionName);
      if (!existCollection) {
        return res.status(400).json({
          error: 'Não existe nenhuma predefinição com esse nome',
        });
      }

      if (!await this.mongoDbValidation.existValue(databaseName, collectionName, id)) {
        return res.status(400).json({ error: `O registro com o ID '${id}' não existe na tabela '${collectionName}` });
      }

      await this.trashService.restoreValue(databaseName, collectionName, id);

      await req.historic.registerChange();
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
