class ValueController {
  constructor(valueService, mongoDbValidation, whiteList) {
    this.valueService = valueService;
    this.mongoDbValidation = mongoDbValidation;
    this.whiteList = whiteList;
  }

  async store(req, res) {
    try {
      const { collectionName, values } = req.body;

      if (!collectionName || !values || values.length <= 0) {
        return res.status(400).json({
          error: 'Valores inválidos',
        });
      }

      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      const formatedValues = await this.valueService.formateValueToInsert(database, collectionName, values);
      if (formatedValues.errorMsg) return res.status(400).json({ error: formatedValues.errorMsg });
      await this.valueService.insertValues(database, collectionName, formatedValues);

      await req.historic.registerChange();

      return res.status(200).json({
        success: 'Cadastro bem sucedido',
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    const { collectionName } = req.params;
    const limit = req.params.limit || 10000;

    if (!collectionName) {
      return res.status(400).json({
        error: 'Envie os valores corretos',
      });
    }

    try {
      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      const query = [
        {
          $match: {
            active: true
          }
        },
        {
          $project: {
            active: 0
          }
        }
      ];
      const formatedValues = await this.valueService.listDocuments(database, collectionName, limit, query);

      await req.historic.registerChange();
      return res.status(200).json(formatedValues);
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async delete(req, res) {
    try {
      const { collectionName } = req.params;
      const { valuesId } = req.body;
      const permanent = req.params.permanent === 'true';

      if (!collectionName || !valuesId || valuesId.length <= 0) {
        return res.status(400).json({
          error: 'Valores inválidos',
        });
      }

      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      const errors = []

      if (permanent) {
        for (const id of valuesId) {
          const result = await this.valueService.deleteValue(database, collectionName, id);
          if (result.deletedCount <= 0) {
            errors.push(`O documento com id ${id} não foi encontrado.`)
          }
        }
      }

      for (const id of valuesId) {
        const result = await this.valueService.moveValueToTrash(database, collectionName, id);
        if (result.modifiedCount <= 0) {
          errors.push(`O documento com id ${id} não foi encontrado.`)
        }
      }

      await req.historic.registerChange();
      if (errors.length >= 1) return res.status(400).json({ error: errors })
      return res.status(200).json('Operação bem sucedida')
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { collectionName, values } = req.body;

      if (!collectionName || !values || Object.keys(values).length <= 0 || !id) {
        return res.status(400).json({
          error: 'Valores inválidos',
        });
      }
      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      if (!await this.mongoDbValidation.existValue(database, collectionName, id)) {
        return res.status(400).json({ error: `O registro com o ID '${id}' não existe na tabela '${collectionName}` });
      }

      await this.valueService.updateDocument(database, collectionName, values, id);

      await req.historic.registerChange();

      return res.json({
        success: 'alterado com sucesso',
      });
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default ValueController;
