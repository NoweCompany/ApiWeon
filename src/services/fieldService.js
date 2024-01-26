class FieldService {
  constructor(mongoDb, convertTypeToBsonType) {
    this.mongoDb = mongoDb;
    this.convertTypeToBsonType = convertTypeToBsonType;
    this.client = null;
  }

  async closeConnection() {
    try {
      if (this.client) {
        await this.client.close();
        console.log('Conexão fechada com sucesso.');
      }
    } catch (err) {
      throw new Error(`Erro ao fechar a conexão: ${err.message}`);
    }
  }

  async openConnection(databaseName) {
    try {
      this.mongoDb.database = databaseName;

      this.client = await this.mongoDb.connect();
      return this.client;
    } catch (err) {
      console.error(`Erro ao definir cliente: ${err.message}`);
      throw new Error(`Erro ao definir cliente: ${err.message}`);
    }
  }

  async listPropertiesOfSchemaValidation(database, collectionName) {
    try {
      const databaseRef = this.client.db(database);

      if (!(await this.mongoDb.existCollection(collectionName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      const collection = databaseRef.collection(collectionName);
      const rule = await collection.options();

      if (!rule.validator || !rule.validator.$jsonSchema) {
        return { msg: 'Não há nenhum campo criado', status: 400 };
      }

      const { properties, required } = rule.validator.$jsonSchema;

      return Object.entries(properties)
        .filter(([key]) => key !== 'default' && key !== 'active')
        .map(([key, value]) => ({
          key,
          type: value.bsonType,
          required: required.includes(key),
        }));
    } catch (error) {
      console.error(`Erro ao listar schema validator: ${error.message}`);
      throw new Error('Erro ao listar schema validator');
    }
  }

  async registerNewValitorRule(
    database,
    collectionName,
    fieldName,
    options,
  ) {
    try {
      const databaseRef = this.client.db(database);

      if (!(await this.mongoDb.existCollection(collectionName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      let rule;
      const rules = await databaseRef.collection(collectionName).options();

      const propertieValidation = {
        bsonType: options.type,
        description: options.description,
      };

      let { properties, required } = rules.validator.$jsonSchema;

      if (properties[fieldName]) return { msg: 'Este campo já existe', status: 400 };

      if (options.required) {
        required.push(fieldName);
      }

      properties[fieldName] = propertieValidation;

      rule = {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            title: `${collectionName} rule`,
            required,
            properties,
          },
        },
        validationLevel: 'moderate',
        validationAction: 'error',
      };

      const command = {
        collMod: collectionName,
        validator: rule.validator,
      };

      await databaseRef.command(command);
      const valueDafaultForNewField = this.convertTypeToBsonType(options.type, null);

      // Add new key in old documents
      await databaseRef.collection(collectionName).updateMany(
        { [fieldName]: { $exists: false } },
        { $set: { [fieldName]: valueDafaultForNewField } },
      );

      return null;
    } catch (error) {
      console.error(`Erro ao registrar novo campo no schema validator: ${error.message}`);
      throw new Error('Erro ao registrar novo campo no schema validator');
    }
  }

  async removeFielOfVlidation(database, collectionName, fieldName) {
    try {
      const databaseRef = this.client.db(database);

      if (!(await this.mongoDb.existCollection(collectionName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }
      const collection = databaseRef.collection(collectionName);
      const rules = await collection.options();

      let { required, properties } = rules.validator.$jsonSchema;

      if (required.includes(fieldName)) required.splice(required.indexOf(fieldName), 1);
      if (!properties[fieldName]) return { msg: `O campo ${fieldName} não existe`, status: 400 };

      delete properties[fieldName];

      const validator = {
        $jsonSchema: {
          required,
          properties,
        },
      };

      const command = {
        collMod: collectionName,
        validator,
      };

      await databaseRef.command(command);

      // Update all documents, to removing yours properties
      await collection.updateMany({}, { $unset: { [fieldName]: '' } });
      // Delet all objects that have fewer than three keys
      await collection.deleteMany({ $expr: { $lt: [{ $size: { $objectToArray: '$$ROOT' } }, 4] } });
    } catch (error) {
      console.error(`Erro ao remover campo do schema validator: ${error.message}`);
      throw new Error('Erro ao remover campo do schema validator');
    }
  }

  async updateFieldOfvalidation(database, collectionName, fieldName, newFieldName, fieldRequired, newValues) {
    try {
      const databaseRef = this.client.db(database);

      if (!(await this.mongoDb.existCollection(collectionName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      const collection = databaseRef.collection(collectionName);

      let { required, properties } = (await collection.options()).validator.$jsonSchema;

      const indice = required.indexOf(fieldName);

      if (!fieldRequired && indice !== -1) {
        required.splice(indice, 1);
      } else if (fieldRequired && indice === -1) {
        required.push(newFieldName);
      } else if (indice !== -1 && fieldName !== newFieldName) {
        required.splice(indice, 1);
        required.push(newFieldName);
      }

      if (!properties?.[fieldName]) return { msg: 'Esse campo não existe', status: 400 };

      delete properties[fieldName];
      properties[newFieldName] = { bsonType: newValues.type, description: newValues.description };

      const validator = {
        $jsonSchema: {
          bsonType: 'object',
          required,
          properties,

        },
      };

      const command = {
        collMod: collectionName,
        validator,
      };

      await databaseRef.command(command);
      return null;
    } catch (error) {
      console.error(`Erro ao atulaizar campo no schema validator: ${error.message}`);
      throw new Error('Erro ao atulaizar campo no schema validator');
    }
  }
}

export default FieldService;
