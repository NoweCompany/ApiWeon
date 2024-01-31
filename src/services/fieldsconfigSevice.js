class FieldsConfig {
  constructor(mongoDb) {
    this.mongoDb = mongoDb;
    this.clientMongoDb = null;
  }

  async setClient() {
    try {
      this.clientMongoDb = await this.mongoDb.connect();
    } catch (error) {
      console.log('Error ao setar client mongodb');
      return { msg: 'Error ao setar client mongodb', status: 500 };
    }
  }

  async #createCollectionFieldConfig(databaseName) {
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

      await this.setClient();
      const databaseRef = this.clientMongoDb.db(databaseName);
      await databaseRef.createCollection(
        'FieldsConfig',
        valitationSchema,
      );
    } catch (err) {
      throw new Error('Erro ao criar collection de configuração de campos.');
    }
  }

  // Create and store field in collection FieldConfig
  async setFieldInConfig(databaseName, collectionName, originalNameField, currentNameField, typeField, fieldIsRequired, description) {
    console.log(this.clientMongoDb);
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
      await this.setClient();
      const databseRef = this.clientMongoDb.db(databaseName);
      const existCollection = await this.mongoDb.existCollection(collectionName, databaseName);

      if (!existCollection) await this.#createCollectionFieldConfig();
      const collection = databseRef.collection('FieldsConfig');

      // const existField = await collection.findOne({
      //   $or: {
      //     { 'fieldsEspecifications.originalName': originalNameField },
      //     { 'fieldsEspecifications.originalName': originalNameField},
      //   }
      // })

      const fieldDocument = {
        originalName: originalNameField,
        currentName: currentNameField,
        type: typeField,
        require: fieldIsRequired,
        allNames: [currentNameField],
        description,
      };

      await collection.insertOne({ collectionName, fieldsEspecifications: fieldDocument });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async listFields(databaseName, collectionName) {
    if (
      typeof databaseName !== 'string'
      || typeof collectionName !== 'string'
    ) {
      throw new Error('Uma ou mais variáveis são inválidas');
    }
    try {
      await this.setClient();

      const databaseRef = this.clientMongoDb.db(databaseName);

      const existCollection = await this.mongoDb.existCollection('FieldsConfig', databaseName);
      if (!existCollection) return { msg: 'Não há nenhum campo cadastrado nessa collection', status: 400 };

      const collectionRef = databaseRef.collection('FieldsConfig');

      const list = await collectionRef.find({ collectionName }).toArray();
      return list;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao listar campos de uma collection, mensegem de erro');
    }
  }

  async updateFieldInFieldsConfig(
    databaseName,
    collectionName,
    fieldName,
    originalName,
    newValues,
  ) {
    const {
      newFieldName, type, fieldRequired, description,
    } = newValues;

    if (
      typeof databaseName !== 'string'
      || typeof collectionName !== 'string'
      || typeof fieldName !== 'string'
      || typeof newFieldName !== 'string'
      || typeof type !== 'string'
      || typeof fieldRequired !== 'boolean'
      || typeof originalName !== 'string'
      || typeof description !== 'string'
    ) {
      throw new Error('Uma ou mais variáveis são inválidas');
    }
    try {
      await this.setClient();

      const databaseRef = this.clientMongoDb.db(databaseName);

      const existCollection = await this.mongoDb.existCollection('FieldsConfig', databaseName);
      if (!existCollection) return { msg: 'Não há nenhum campo cadastrado nessa collection', status: 400 };

      const collectionRef = databaseRef.collection('FieldsConfig');

      const existField = await collectionRef.find(
        {
          $and: [
            { 'fieldsEspecifications.currentName': fieldName },
            { 'fieldsEspecifications.originalName': originalName },
          ],
        },
      ).toArray();

      console.log(existField.length);
      if (existField.length <= 0) return { msg: `Não há nenhum campo com o nome ${fieldName}`, status: 400 };

      await collectionRef.updateOne(
        {
          $and: [
            { collectionName },
            { 'fieldsEspecifications.currentName': fieldName },
          ],
        },
        {
          $set: {
            collectionName,
            fieldsEspecifications: {
              originalName,
              currentName: newFieldName,
              type,
              required: fieldRequired,
              description,
              allNames: [newFieldName],
            },
          },
        },
      );

      return true;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao atualizar campos de uma collection FieldsConfig');
    }
  }
}

export default FieldsConfig;
