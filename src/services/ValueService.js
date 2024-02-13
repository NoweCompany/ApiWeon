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
        console.log(value);
        if (Object.keys(value).length <= 0 || !value) {
          return { errorMsg: 'Valores inválidos, todos objetos devem pelo menos ter uma chave válida de acordo com as regras de validação!' };
        }
        value.active = true;
        // verify if each values has a appropriate key
        Object.keys(properties).forEach((key) => {
          const ValueOfProperty = properties[key];
          if (!Object.prototype.hasOwnProperty.call(value, key) && !required.includes(key)) {
            value[key] = this.convertTypeToBsonType(ValueOfProperty.bsonType, null);
          }
        });
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

  formaterListOfDocuments(list) {
    try {
      const newlist = list.map((doc) => {
        let newDoc = { ...doc };

        const { default: defaultValue, active, ...rest } = newDoc;
        return rest;
      });

      return newlist;
    } catch (error) {
      throw new Error('Error ao formatar lista de documentos de uma predefinição');
    }
  }

  async listDocumentsActives(databaseName, collectionName, limit) {
    try {
      const databaseRef = this.client.db(databaseName);
      const collection = databaseRef.collection(collectionName);
      const values = await collection.find({ active: true }).limit(Number(limit)).toArray();

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
