import { randomUUID } from 'node:crypto';

class FieldService {
  constructor(mongoDb, convertTypeToBsonType, fieldconfigService) {
    this.mongoDb = mongoDb;
    this.convertTypeToBsonType = convertTypeToBsonType;
    this.fieldconfigService = fieldconfigService;
    this.clientMongoDb = null;
  }

  async setClient() {
    try {
      this.clientMongoDb = await this.mongoDb.connect();
      return this.clientMongoDb;
    } catch (error) {
      console.log('Error ao setar client mongodb');
      return { msg: 'Error ao setar client mongodb', status: 500 };
    }
  }

  async listPropertiesOfSchemaValidation(databaseName, collectionName) {
    try {
      const list = await this.fieldconfigService.listFields(databaseName, collectionName);

      const formattedData = list.map((doc) => ({
        key: doc.fieldsEspecifications.currentName,
        type: doc.fieldsEspecifications.type,
        require: doc.fieldsEspecifications.require,
        allNames: doc.fieldsEspecifications.allNames,
        currentName: doc.fieldsEspecifications.currentName,
        originalName: doc.fieldsEspecifications.originalName,
      }));

      return {
        collectionName,
        fields: formattedData,
      };
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
      await this.setClient();
      const databaseRef = this.clientMongoDb.db(database);
      if (!(await this.mongoDb.existCollection(collectionName, database))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      let rule;
      const rules = await databaseRef.collection(collectionName).options();

      const propertieValidation = {
        bsonType: options.type,
        description: options.description,
      };

      const originalName = `${fieldName}_${randomUUID()}`;

      let { properties, required } = rules.validator.$jsonSchema;

      for (const propertie in properties) {
        if (propertie.split('_')[0] === fieldName) return { msg: 'Este campo já existe', status: 400 };
      }

      if (options.required) {
        required.push(originalName);
      }

      properties[originalName] = propertieValidation;

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
        { [originalName]: { $exists: false } },
        { $set: { [originalName]: valueDafaultForNewField } },
      );
      await this.fieldconfigService.setFieldInConfig(
        database,
        collectionName,
        originalName,
        fieldName,
        options.type,
        options.required,
        options.description,
      );

      return null;
    } catch (error) {
      console.error(`Erro ao registrar novo campo no schema validator: ${error}`);
      throw new Error('Erro ao registrar novo campo no schema validator');
    }
  }

  async removeFielOfVlidation(databaseName, collectionName, fieldName, originalName) {
    try {
      await this.setClient();
      const databaseRef = this.clientMongoDb.db(databaseName);

      if (!(await this.mongoDb.existCollection(collectionName, databaseName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      const collection = databaseRef.collection(collectionName);
      const rules = await collection.options();

      let { required, properties } = rules.validator.$jsonSchema;

      if (required.includes(originalName)) required.splice(required.indexOf(originalName), 1);
      if (!properties[originalName]) return { msg: `O campo ${fieldName} não existe`, status: 400 };

      delete properties[originalName];

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

      const removed = await this.fieldconfigService.removeFieldInFieldsConfig(databaseName, collectionName, fieldName, originalName);
      if (removed.msg && removed.status) return removed;

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

  async updateFieldOfvalidation(databaseName, collectionName, fieldName, originalName, newValues) {
    try {
      await this.setClient();
      const databaseRef = this.clientMongoDb.db(databaseName);

      const {
        type, fieldRequired, description,
      } = newValues;

      if (!(await this.mongoDb.existCollection(collectionName, databaseName))) {
        return { msg: 'Essa predefinição não existe', status: 400 };
      }

      const collection = databaseRef.collection(collectionName);

      let { required, properties } = (await collection.options()).validator.$jsonSchema;

      if (!properties?.[originalName]) return { msg: 'Esse campo não existe', status: 400 };

      const indice = required.indexOf(originalName);

      if (!fieldRequired && indice !== -1) {
        required.splice(indice, 1);
      } else if (fieldRequired && indice === -1) {
        required.push(originalName);
      }

      properties[originalName] = { bsonType: type, description };

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

      const updated = await this.fieldconfigService.updateFieldInFieldsConfig(
        databaseName,
        collectionName,
        fieldName,
        originalName,
        newValues,
      );

      if (updated.msg && updated.status) return updated;

      await databaseRef.command(command);
      return null;
    } catch (error) {
      console.error(`Erro ao atulaizar campo no schema validator: ${error.message}`);
      throw new Error('Erro ao atulaizar campo no schema validator');
    }
  }
}

export default FieldService;
