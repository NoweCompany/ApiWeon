export default class ValueService {
  constructor(mongoInstance, convertTypeToBsonType) {
    this.client = mongoInstance;
    this.convertTypeToBsonType = convertTypeToBsonType;
  }

  async formateValueToInsert(databaseName, collectionName, values) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);
      const rules = await collection.options();
      const { properties, required } = rules.validator.$jsonSchema;

      // This "for" passes through each value in the array
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        if (Object.keys(value).length <= 0 || !value) {
          return { errorMsg: 'Valores inválidos, todos objetos devem pelo menos ter uma chave válida de acordo com as regras de validação!' };
        }
        value.active = true;

        // Tranform type of each field validation
        for (const entriesOfValue of Object.entries(value)) {
          const keyOfDocument = entriesOfValue[0];
          const valueOfDocument = entriesOfValue[1];
          const typeOfkeyValue = properties[keyOfDocument]?.bsonType;

          if (!keyOfDocument) return { errorMsg: `Chave do documento enviado não é valida!${value}` };
          if (!typeOfkeyValue) return { errorMsg: 'Tipo da chave de validação inválidas!' };

          value[keyOfDocument] = this.convertTypeToBsonType(typeOfkeyValue, valueOfDocument);
        }
      }
      return values;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao formatar valores');
    }
  }

  async listAllDocuments(databaseName, collectionName, limit, query) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const values = await collection.find(query).limit(Number(limit)).toArray();

      return values;
    } catch (error) {
      throw new Error('Error ao lsitar documentos em uma predefinição');
    }
  }

  async listAllDocumentsInCollections(databaseName, collectionNames, limit, query) {
    try {
      const databaseRef = this.client.db(databaseName);
      const results = [];

      for (const collectionName of collectionNames) {
        const collection = databaseRef.collection(collectionName);
        const documents = await collection.find(query).limit(Number(limit)).toArray();
        results.push({
          collectionName,
          values: documents
        });
      }

      return results;
    } catch (error) {
      throw new Error('Erro ao listar documentos em uma ou mais coleções');
    }
  }

  async listDocumentById(databaseName, collectionName, id) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const document = await collection.findOne({ _id: this.convertTypeToBsonType('id', id) });

      return document;
    } catch (error) {
      throw new Error('Erro ao listar documento por ID');
    }
  }

  async listDocuments(databaseName, collectionName, limit, query) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const values = await collection.aggregate(query).limit(Number(limit)).toArray();

      return values;
    } catch (error) {
      throw new Error('Error ao lsitar documentos em uma predefinição');
    }
  }

  async updateDocument(databaseName, collectionName, value, id) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);

      const rules = await collection.options();
      const { properties } = rules.validator.$jsonSchema;

      let newValue = value;
      for (const entriesOfValue of Object.entries(newValue)) {
        const keyOfDocument = entriesOfValue[0];
        const valueOfDocument = entriesOfValue[1];
        const typeOfkeyValue = properties[keyOfDocument]?.bsonType;

        if (!typeOfkeyValue) throw new Error('Valores inválidos');
        newValue[keyOfDocument] = this.convertTypeToBsonType(typeOfkeyValue, valueOfDocument);
        if (newValue[keyOfDocument] === null) throw new Error('Valores inválidos, o número enviado ultrapassa o valor máximo de 15 caracteres');
      }
      await collection.updateOne(
        { _id: this.convertTypeToBsonType('id', id) },
        { $set: newValue },
      );
    } catch (error) {
      throw new Error('Error ao atualizar documento de uma predefinição');
    }
  }

  async moveValueToTrash(databaseName, collectionName, id) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const result = await collection.updateOne({ _id: this.convertTypeToBsonType('id', id) }, { $set: { active: false } });
      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Error ao mover valor para lixeira');
    }
  }

  async deleteValue(databaseName, collectionName, id) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const result = await collection.deleteOne({ _id: this.convertTypeToBsonType('id', id) });
      return result;
    } catch (error) {
      throw new Error('Error ao deletar valor');
    }
  }

  async insertValues(databaseName, collectionName, values) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);

      await collection.insertMany(values);
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao cadastrar valores em predefinição');
    }
  }
}
