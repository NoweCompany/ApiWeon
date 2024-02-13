import { randomUUID } from 'node:crypto';

class FieldService {
  constructor(clientMongoDb, convertTypeToBsonType) {
    this.clientMongoDb = clientMongoDb;
    this.convertTypeToBsonType = convertTypeToBsonType;
  }

  async registerNewValidatorRule(database, collectionName, fieldName, uniqueName, options, rules) {
    try {
      const databaseRef = this.clientMongoDb.db(database);
      const { properties, required } = rules.validator.$jsonSchema;

      const propertieValidation = {
        bsonType: options.type,
        description: options.description,
      };
      if (options.required) {
        required.push(uniqueName);
      }
      properties[uniqueName] = propertieValidation;

      const rule = {
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
      await this.addNewFieldToExistingDocuments(databaseRef, collectionName, uniqueName, options);

      return null;
    } catch (error) {
      console.error(`Erro ao registrar novo campo no schema validator: ${error}`);
      throw new Error('Erro ao registrar novo campo no schema validator');
    }
  }

  async getCollectionValidatorRules(databaseName, collectionName) {
    const rules = await this.clientMongoDb.db(databaseName).collection(collectionName).options();
    return rules;
  }

  generateUniqueFieldName(fieldName) {
    return `${fieldName}_${randomUUID()}`;
  }

  checkIfOrinalNameExists(properties, originalName) {
    for (const prop in properties) {
      if (prop === originalName) {
        return true;
      }
    }
    return false;
  }

  checkIfFieldExists(properties, fieldName) {
    for (const prop in properties) {
      if (prop.split('_')[0] === fieldName) {
        return true;
      }
    }
    return false;
  }

  async addNewFieldToExistingDocuments(databaseRef, collectionName, originalName, options) {
    const valueDefaultForNewField = this.convertTypeToBsonType(options.type, null);
    await databaseRef.collection(collectionName).updateMany(
      { [originalName]: { $exists: false } },
      { $set: { [originalName]: valueDefaultForNewField } },
    );
  }

  async removeFielOfVlidation(databaseName, collectionName, fieldName, originalName, rules) {
    try {
      const databaseRef = this.clientMongoDb.db(databaseName);

      const collection = databaseRef.collection(collectionName);

      let { required, properties } = rules.validator.$jsonSchema;

      if (required.includes(originalName)) required.splice(required.indexOf(originalName), 1);
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

      await databaseRef.command(command);
      // Update all documents, to removing yours properties
      await collection.updateMany({}, { $unset: { [originalName]: '' } });
      // Delet all objects that have fewer than three keys
      await collection.deleteMany({ $expr: { $lt: [{ $size: { $objectToArray: '$$ROOT' } }, 4] } });
    } catch (error) {
      console.error(`Erro ao remover campo do schema validator: ${error.message}`);
      throw new Error('Erro ao remover campo do schema validator');
    }
  }

  async updateFieldOfvalidation(databaseName, collectionName, originalName, newValues) {
    try {
      const {
        type, fieldRequired, description,
      } = newValues;

      const databaseRef = this.clientMongoDb.db(databaseName);
      const collection = databaseRef.collection(collectionName);

      let { required, properties } = (await collection.options()).validator.$jsonSchema;

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

      await databaseRef.command(command);
      return null;
    } catch (error) {
      console.error(`Erro ao atulaizar campo no schema validator: ${error.message}`);
      throw new Error('Erro ao atulaizar campo no schema validator');
    }
  }
}

export default FieldService;
