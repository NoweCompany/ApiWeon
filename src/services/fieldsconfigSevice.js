export default class FieldsConfig {
  constructor(client) {
    this.client = client;
  }

  async createCollectionFieldConfig(databaseName) {
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
    try {
      const databseRef = this.client.db(databaseName);
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
    originalName,
    newValues,
  ) {
    const {
      newFieldName, type, fieldRequired, description,
    } = newValues;
    try {
      const databaseRef = this.client.db(databaseName);
      const collectionRef = databaseRef.collection('FieldsConfig');

      await collectionRef.updateOne(
        { collectionName, 'fieldsEspecifications.originalName': originalName },
        {
          $set: {
            'fieldsEspecifications.currentName': newFieldName,
            'fieldsEspecifications.type': type,
            'fieldsEspecifications.required': fieldRequired,
            'fieldsEspecifications.description': description,
            'fieldsEspecifications.allNames': [newFieldName],
          },
        },
      );

      return true;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao atualizar campos de uma collection FieldsConfig');
    }
  }

  async checkIfFieldCurrentExistsInFieldsConfig(databaseName, currentName) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collectionRef = databaseRef.collection('FieldsConfig');

      const existField = await collectionRef.findOne({
        'fieldsEspecifications.currentName': currentName,
      });
      return existField;
    } catch (error) {
      throw new Error('Erro ao verificar se campo exite em fields config');
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
    try {
      const databaseRef = this.client.db(databaseName);
      const collectionRef = databaseRef.collection('FieldsConfig');

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
      throw new Error('Erro ao excluir campos de uma collection FieldsConfig');
    }
  }

  async updateAllNamesOfCollection(databaseName, collectionName, newCollectionName) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection('FieldsConfig');

      const result = await collection.updateMany(
        { collectionName },
        { $set: { collectionName: newCollectionName } },
      );

      console.log(`${result.modifiedCount} documentos atualizados na coleção ${collectionName}`);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar os nomes da coleção:', error);
      return false;
    }
  }
}
