import MongoDb from '../database/mongoDb';

class FieldController {
  async index(req, res) {
    const { collectionName } = req.params;

    if (!collectionName) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);

      if (!await mongoDb.existCollection(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }
      const collection = database.collection(collectionName);

      const rule = await collection.options();
      let fields = [];

      if (Object.keys(rule).length <= 0) {
        throw new Error('Não há nenhum campo criado');
      }

      const { properties } = rule.validator.$jsonSchema;
      const { required } = rule.validator.$jsonSchema;

      fields = (Object.entries(properties)).reduce((accumulator, field) => {
        if (field[0] === 'default' || field[0] === 'active') return accumulator;
        const objFields = {};
        [objFields.key] = field;
        objFields.type = field[1].bsonType;
        objFields.required = !!(required.includes(field[0]));
        accumulator.push(objFields);
        return accumulator;
      }, []);

      const response = { collectionName, fields };

      await req.historic.registerChange(client);

      return res.status(200).json(response);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async store(req, res) {
    const { collectionName, fieldName, options } = req.body;

    if (!collectionName || !options || !fieldName) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);

      if (!await mongoDb.existCollection(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }

      let rule;
      const rules = await database.collection(collectionName).options();

      if (!rules.validator) {
        let properties = {
          [fieldName]: {
            bsonType: options.type,
            description: options.description,
          },
        };

        let required = options.required ? [fieldName] : [];
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
      } else {
        let { properties } = rules.validator.$jsonSchema;
        let { required } = rules.validator.$jsonSchema;

        if (properties[fieldName]) throw new Error('Este campo já existe');

        if (options.required) {
          required.push(fieldName);
        }

        properties[fieldName] = {
          bsonType: options.type,
          description: options.description,
        };

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
      }

      const command = {
        collMod: collectionName,
        validator: rule.validator,
      };

      await database.command(command);
      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Campo criado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async delete(req, res) {
    const { collectionName, fieldName } = req.params;

    if (!fieldName || !collectionName) {
      return res.status(400).json({
        errors: 'Valor inválido',
      });
    }

    if (fieldName === 'default') {
      return res.status(400).json({
        errors: 'Esse campo não exite',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);
      const collection = database.collection(collectionName);
      const rules = await collection.options();

      let { required } = rules.validator.$jsonSchema;
      if (required.includes(fieldName)) required.splice(required.indexOf(fieldName), 1);

      let { properties } = rules.validator.$jsonSchema;
      if (!properties[fieldName]) throw new Error(`O campo ${fieldName} não existe`);

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

      await database.command(command);

      // Update all documents, to removing yours properties
      await collection.updateMany({}, { $unset: { [fieldName]: '' } });
      // Delet all objects that have fewer than three keys
      await collection.deleteMany({ $expr: { $lt: [{ $size: { $objectToArray: '$$ROOT' } }, 4] } });

      await req.historic.registerChange(client);

      return res.status(200).json({
        success: 'Campo deletado com sucesso',
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    const {
      collectionName, fieldName, newFieldName, fieldRequired, newValues,
    } = req.body;

    if (!collectionName || !fieldName || !newValues) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    if (fieldName === 'default') {
      return res.status(400).json({
        errors: 'Esse campo não exite',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);
      const collection = database.collection(collectionName);

      let { required } = (await collection.options()).validator.$jsonSchema;
      const indice = required.indexOf(fieldName);
      if (!fieldRequired && indice !== -1) {
        required.splice(indice, 1);
      } else if (fieldRequired && indice === -1) {
        required.push(newFieldName);
      } else if (indice !== -1 && fieldName !== newFieldName) {
        required.splice(indice, 1);
        required.push(newFieldName);
      }

      let { properties } = (await collection.options()).validator.$jsonSchema;
      const fields = Object.keys(properties);
      if (!fields.includes(fieldName)) throw new Error('Esse campo não existe');

      delete properties[fieldName];
      properties[newFieldName || fieldName] = { bsonType: newValues.type, description: newValues.description };

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

      await database.command(command);
      await req.historic.registerChange(client);

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

export default new FieldController();
