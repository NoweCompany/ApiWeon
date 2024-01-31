import whiteList from '../config/whiteList';

class FieldController {
  constructor(fieldService, mongoDb) {
    this.fieldService = fieldService;
    this.mongoDb = mongoDb;
  }

  async index(req, res) {
    const { collectionName } = req.params;

    if (!collectionName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    try {
      const databaseName = req.company;
      const responseList = await this.fieldService.listPropertiesOfSchemaValidation(databaseName, collectionName);

      if (responseList.msg && responseList.status) {
        return res.status(responseList.status).json({
          errors: responseList.msg,
        });
      }

      const response = { collectionName, fields: responseList };

      await req.historic.registerChange(this.mongoDb.connection);

      return res.status(200).json(response);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      this.mongoDb.close();
    }
  }

  async store(req, res) {
    const { collectionName, fieldName, options } = req.body;

    if (!collectionName || !options || !fieldName) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    try {
      const database = req.company;
      const responseRegisterField = await this.fieldService.registerNewValitorRule(
        database,
        collectionName,
        fieldName,
        options,
      );
      if (responseRegisterField?.msg && responseRegisterField?.status) {
        return res.status(responseRegisterField.status).json({
          errors: responseRegisterField.msg,
        });
      }

      await req.historic.registerChange(this.mongoDb.connection);

      return res.status(200).json({
        success: 'Campo criado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      this.mongoDb.close();
    }
  }

  async delete(req, res) {
    const { collectionName, fieldName } = req.params;

    if (!fieldName || !collectionName) {
      return res.status(400).json({
        errors: 'Valor inválido',
      });
    }
    if (whiteList.fields.includes(fieldName)) {
      return res.status(400).json({
        errors: 'Esse campo não exite',
      });
    }

    try {
      const database = req.company;
      const client = await this.fieldService.openConnection(database);
      const reponseRemoveField = await this.fieldService.removeFielOfVlidation(database, collectionName, fieldName);

      if (reponseRemoveField?.msg && reponseRemoveField?.status) {
        return res.status(reponseRemoveField.status).json({
          errors: reponseRemoveField.msg,
        });
      }

      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Campo deletado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      this.mongoDb.close();
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
    const {
      collectionName, fieldName, originalName, newValues,
    } = req.body;

    if (!collectionName || !fieldName || !originalName || !newValues) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    if (whiteList.fields.includes(fieldName)) {
      return res.status(400).json({
        errors: 'Esse campo não exite',
      });
    }

    try {
      const database = req.company;
      const reponseUpdateField = await this.fieldService.updateFieldOfvalidation(
        database,
        collectionName,
        fieldName,
        originalName,
        newValues,
      );

      if (reponseUpdateField?.msg && reponseUpdateField?.status) {
        return res.status(reponseUpdateField.status).json({
          errors: reponseUpdateField.msg,
        });
      }

      await req.historic.registerChange(this.mongoDb.connection);
      return res.json({
        success: 'Campo alterado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default FieldController;
