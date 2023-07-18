import Permission from '../models/PermissionsModel';

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
        const objFields = {};
        [objFields.key] = field;
        objFields.type = field[1].bsonType;
        objFields.required = !!(required.includes(field[0]));
        accumulator.push(objFields);
        return accumulator;
      }, []);

      const response = { collectionName, fields };

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
    const existPermission = await Permission.checksPermission(req.userId, 'insert');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }

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
          validationLevel: 'strict',
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
          validationLevel: 'strict',
          validationAction: 'error',
        };
      }

      const command = {
        collMod: collectionName,
        validator: rule.validator,
      };

      await database.command(command);

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
    const existPermission = await Permission.checksPermission(req.userId, 'delet');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }

    const { collectionName, fieldName } = req.params;

    if (!fieldName || !collectionName) {
      return res.status(400).json({
        errors: 'Valor inválido',
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

      return res.status(200).json({
        success: 'Campo deletado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    const existPermission = await Permission.checksPermission(req.userId, 'edit');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }

    const {
      collectionName, fieldName, newFieldName, fieldRequired, newValues,
    } = req.body;

    if (!collectionName || !fieldName || !newValues) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      await mongoDb.existDb(req.company);
      const database = client.db(req.company);
      const collection = database.collection(collectionName);

      let { required } = (await collection.options()).validator.$jsonSchema;
      if (fieldRequired) {
        const indice = required.indexOf(fieldName);
        required.splice(indice, 1, newFieldName || fieldName);
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
