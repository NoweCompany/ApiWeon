class CollectionController {
  constructor(collectionService, fieldsConfigService) {
    this.collectionService = collectionService;
    this.fieldsConfigService = fieldsConfigService;
  }

  // table
  async store(req, res) {
    try {
      const { collectionName } = req.body;
      if (!collectionName) {
        return res.status(400).json({
          error: 'Envie os valores corretos',
        });
      }
      const dataBaseName = req.company;

      const existCollection = await this.collectionService.veryIfexistCollection(dataBaseName, collectionName);
      if (existCollection) {
        return res.status(400).json({
          error: 'Já existe uma predefinição criada com esse nome',
        });
      }

      await this.collectionService.createNewCollection(dataBaseName, collectionName);

      await req.historic.registerChange();

      return res.status(200).json('Predefinição criada com sucesso');
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    try {
      const collections = await this.collectionService.listCollectionsInDatabase(req.company);
      const response = await Promise.all(collections.map(async (collectionName) => {
        const fields = await this.fieldsConfigService.listFields(req.company, collectionName);
        return { collectionName, fields };
      }));

      await req.historic.registerChange();
      if (response.length <= 0) return res.status(200).json('Não há tabelas criadas');

      return res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async delete(req, res) {
    try {
      const { collectionName } = req.body;

      if (!collectionName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const existCollection = await this.collectionService.veryIfexistCollection(req.company, collectionName);
      if (!existCollection) {
        return res.status(400).json({
          error: 'Não existe nenhuma predefinição com esse nome',
        });
      }

      await this.collectionService.deleteCollection(req.company, collectionName);
      await this.fieldsConfigService.removeAllFieldsInCollection(req.company, collectionName);

      await req.historic.registerChange();

      return res.status(200).json({
        success: 'Sua predefinição foi excluida com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    const { collectionName, newName } = req.body;

    if (!collectionName || !newName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    try {
      const isValidColleciton = await this.collectionService.isValidCollectionName(collectionName, newName);
      if (!isValidColleciton) {
        return res.status(400).json({
          errors: 'Esses nome de collection não é validos',
        });
      }

      const existCollection = await this.collectionService.veryIfexistCollection(req.company, collectionName);
      if (!existCollection) {
        return res.status(400).json({
          error: 'Não existe nenhuma predefinição com esse nome',
        });
      }

      const existNewCollection = await this.collectionService.veryIfexistCollection(req.company, newName);
      if (existNewCollection) {
        return res.status(400).json({
          error: 'Já existe uma predefinição com esse nome',
        });
      }

      await this.fieldsConfigService.updateAllNamesOfCollection(req.company, collectionName, newName);
      await this.collectionService.renameCollection(req.company, collectionName, newName);

      await req.historic.registerChange();

      return res.status(200).json({
        success: 'Tabela renomeada com sucesso',
      });
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default CollectionController;
