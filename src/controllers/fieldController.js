// STORE -> Adicionar trasaction
class FieldController {
  constructor(fieldService, fieldsConfigService, mongoDbValidation, whiteList) {
    this.fieldService = fieldService;
    this.fieldsConfigService = fieldsConfigService;
    this.mongoDbValidation = mongoDbValidation;
    this.whiteList = whiteList;
  }

  async index(req, res) {
    const { collectionName } = req.params;

    if (!collectionName) {
      return res.status(400).json({
        error: 'Envie os valores corretos',
      });
    }

    try {
      const databaseName = req.company;
      if (!await this.mongoDbValidation.existCollection(databaseName, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      const responseList = await this.fieldsConfigService.listFields(databaseName, collectionName);

      await req.historic.registerChange();

      return res.status(200).json({
        collectionName,
        fields: [...responseList],
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async store(req, res) {
    const { collectionName, fieldName, options } = req.body;

    if (!collectionName || !options || !fieldName) {
      return res.status(400).json({
        error: 'Valores inválidos',
      });
    }

    try {
      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      const rules = await this.fieldService.getCollectionValidatorRules(database, collectionName);
      const fieldExists = this.fieldService.checkIfFieldExists(rules.validator.$jsonSchema.properties, fieldName);
      if (fieldExists) {
        return res.status(400).json({ error: 'Esse campo já existe' });
      }

      const uniqueName = this.fieldService.generateUniqueFieldName(fieldName);
      await this.fieldService.registerNewValidatorRule(
        database,
        collectionName,
        fieldName,
        uniqueName,
        options,
        rules,
      );
      if (!this.mongoDbValidation.existCollection(database, 'FieldsConfig')) await this.fieldsConfigService.createCollectionFieldConfig(database);
      await this.fieldsConfigService.setFieldInConfig(
        database,
        collectionName,
        uniqueName,
        fieldName,
        options.type,
        options.required,
        options.description,
      );
      await req.historic.registerChange();

      return res.status(200).json({
        success: 'Campo criado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async delete(req, res) {
    try {
      const { collectionName, fieldName, originalName } = req.params;

      if (!fieldName || !collectionName) {
        return res.status(400).json({
          error: 'Valor inválido',
        });
      }

      const database = req.company;
      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      if (this.whiteList.fields.includes(fieldName)) {
        return res.status(400).json({
          error: 'Esse campo não exite',
        });
      }
      const rules = await this.fieldService.getCollectionValidatorRules(database, collectionName);
      const fieldExists = await this.fieldsConfigService.checkIfFieldCurrentExistsInFieldsConfig(database, fieldName);
      if (!fieldExists) {
        return res.status(400).json({ error: `O campo ${fieldName} não existe!` });
      }

      const originalNameExist = await this.fieldService.checkIfOrinalNameExists(rules.validator.$jsonSchema.properties, originalName);
      if (!originalNameExist) {
        return res.status(400).json({ error: 'O originalName esta incorreto' });
      }

      await this.fieldService.removeFielOfVlidation(
        database,
        collectionName,
        fieldName,
        originalName,
        rules,
      );
      await this.fieldsConfigService.removeFieldInFieldsConfig(
        database,
        collectionName,
        fieldName,
        originalName,
      );

      await req.historic.registerChange();

      return res.status(200).json({
        success: 'Campo deletado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  /*
    Body: {
      collectionName: "",
      fieldName: "",
      originalName: ""
      newValues: {
        newFieldName: "",
        type:""
        fieldRequired: "",
        description: ""
      }
    }
  */
  async update(req, res) {
    try {
      const {
        collectionName, originalName, newValues,
      } = req.body;

      if (!collectionName || !originalName || !newValues) {
        return res.status(400).json({
          error: 'Valores inválidos',
        });
      }

      const database = req.company;

      if (!await this.mongoDbValidation.existCollection(database, collectionName)
        || this.whiteList.collections.includes(collectionName)) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      if (!await this.mongoDbValidation.existCollection(database, 'FieldsConfig')) {
        return res.status(400).json({ error: 'Essa predefinição não possui campos' });
      }
      const rules = await this.fieldService.getCollectionValidatorRules(database, collectionName);

      const originalNameExist = await this.fieldService.checkIfOrinalNameExists(rules.validator.$jsonSchema.properties, originalName);
      if (!originalNameExist) {
        return res.status(400).json({ error: 'O originalName esta incorreto' });
      }

      await this.fieldService.updateFieldOfvalidation(
        database,
        collectionName,
        originalName,
        newValues,
      );
      await this.fieldsConfigService.updateFieldInFieldsConfig(
        database,
        collectionName,
        originalName,
        newValues,
      );

      await req.historic.registerChange();
      return res.json({
        success: 'Campo alterado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default FieldController;
