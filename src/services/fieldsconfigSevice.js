import { randomUUID } from 'node:crypto';

class FieldsConfig {
  constructor(MongoDb, clientMongoDb, database) {
    this.MongoDb = MongoDb;
    this.clientMongoDb = clientMongoDb;
    this.databaseName = database;
    this.databaseRef = this.clientMongoDb.db(this.databaseName);
  }

  async createCollectionFieldConfig() {
    try {
      const valitationSchema = {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['collectionName', 'fields'],
            properties: {
              collectionName: {
                bsonType: 'string',
                description: 'Deve ser uma string e é obrigatório',
              },
              fieldsEspecifications: {
                bsonType: 'object',
                description: 'Deve ser um objeto e é obrigatório',
                patternProperties: {
                  bsonType: 'object',
                  required: ['originalName', 'currentName', 'type', 'require', 'allNames'],
                  properties: {
                    originalName: {
                      bsonType: 'string',
                      description: 'Deve ser uma string e é obrigatório',
                    },
                    currentName: {
                      bsonType: 'string',
                      description: 'Deve ser uma string e é obrigatório',
                    },
                    type: {
                      bsonType: 'string',
                      description: 'Deve ser uma string e é obrigatório',
                    },
                    require: {
                      bsonType: 'bool',
                      description: 'Deve ser um booleano e é obrigatório',
                    },
                    allNames: {
                      bsonType: 'array',
                      description: 'Deve ser um array e é obrigatório',
                    },
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
        validationLevel: 'moderate',
        validationAction: 'error',
      };
      await this.databaseRef.createCollection('FieldsConfig', valitationSchema);
    } catch (err) {
      throw new Error('Erro ao criar collection de configuração de campos.');
    }
  }

  // Create and store field in collection FieldConfig
  async setFieldInConfig(collectionName, originalNameField, typeField, fieldIsRequired, description) {
    if (
      typeof collectionName !== 'string'
      || typeof originalNameField !== 'string'
      || typeof typeField !== 'string'
      || typeof fieldIsRequired !== 'boolean'
      || typeof description !== 'string'
    ) {
      throw new Error('Uma ou mais variáveis são inválidas');
    }
    try {
      const collection = this.databaseRef.collection('FieldsConfig');
      const existCollection = await this.MongoDb.existCollection(collectionName);
      if (!existCollection) await this.createCollectionFieldConfig();

      // const existField = await collection.findOne({
      //   $or: {
      //     { 'fieldsEspecifications.originalName': originalNameField },
      //     { 'fieldsEspecifications.originalName': originalNameField},
      //   }
      // })

      const fieldDocument = {
        originalName: `${originalNameField}_${randomUUID()}`,
        currentName: originalNameField,
        type: typeField,
        require: fieldIsRequired,
        allNames: [originalNameField],
        description,
      };

      await collection.insertOne({ collectionName, fieldsEspecifications: fieldDocument });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}

export default FieldsConfig;
