export default class FieldsConfig {
  constructor(mongoDbValidation, client) {
    this.mongoDbValidation = mongoDbValidation;
    this.client = client;
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
                  required: ['originalName', 'currentName', 'type', 'required', 'allNames'],
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
                    required: {
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

      const databaseRef = this.client.db(databaseName);
      await databaseRef.createCollection(
        'FieldsConfig',
        valitationSchema,
      );
    } catch (err) {
      throw new Error('Erro ao criar collection de configuração de campos.');
    }
  }

  // Create and store field in collection FieldConfig
  async setFieldInConfig(
    databaseName,
    collectionName,
    originalNameField,
    currentNameField,
    typeField,
    fieldIsRequired,
    description,
  ) {
    console.log(this.client);
    if (
      typeof collectionName !== 'string'
      || typeof originalNameField !== 'string'
      || typeof typeField !== 'string'
      || typeof fieldIsRequired !== 'boolean'
      || typeof description !== 'string'
    ) {
      return { msg: 'Uma ou mais variáveis são inválidas', status: 400 };
    }
    try {
      const databseRef = this.client.db(databaseName);
      const existCollection = await this.mongoDbValidation.existCollection(collectionName, databaseName);

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
        required: fieldIsRequired,
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
      return { msg: 'Uma ou mais variáveis são inválidas', status: 400 };
    }
    try {
      const databaseRef = this.client.db(databaseName);

      const collectionRef = databaseRef.collection('FieldsConfig');

      const list = await collectionRef.find({ collectionName }).toArray();

      const formattedData = list.map((doc) => ({
        key: doc.fieldsEspecifications.currentName,
        type: doc.fieldsEspecifications.type,
        required: doc.fieldsEspecifications.required,
        allNames: doc.fieldsEspecifications.allNames,
        currentName: doc.fieldsEspecifications.currentName,
        originalName: doc.fieldsEspecifications.originalName,
      }));

      return formattedData;
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
      return { msg: 'Uma ou mais variáveis são inválidas', status: 400 };
    }
    try {
      const databaseRef = this.client.db(databaseName);

      const existCollection = await this.mongoDbValidation.existCollection('FieldsConfig', databaseName);
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

  async removeAllFieldsInCollection(databaseName, collectionName) {
    try {
      const databaseRef = this.client.db(databaseName);
      await databaseRef.collection('FieldsConfig').deleteMany({
        collectionName,
      });
    } catch (error) {
      throw new Error(`Erro ao remover todos os campos da coleção ${collectionName}: ${error.message}`);
    }
  }

  async removeFieldInFieldsConfig(
    databaseName,
    collectionName,
    fieldName,
    originalName,
  ) {
    if (
      typeof databaseName !== 'string'
      || typeof collectionName !== 'string'
      || typeof fieldName !== 'string'
      || typeof originalName !== 'string'
    ) {
      return { msg: 'Uma ou mais variáveis são inválidas', status: 400 };
    }
    try {
      const databaseRef = this.client.db(databaseName);

      const existCollection = await this.mongoDbValidation.existCollection('FieldsConfig', databaseName);
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

      await collectionRef.deleteOne(
        {
          $and: [
            { collectionName },
            { 'fieldsEspecifications.currentName': fieldName },
            { 'fieldsEspecifications.originalName': originalName },
          ],
        },
      );

      return true;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao atualizar campos de uma collection FieldsConfig');
    }
  }
}
