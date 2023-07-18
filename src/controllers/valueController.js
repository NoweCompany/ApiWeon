import { ObjectId } from 'mongodb';
import Permission from '../models/PermissionsModel';

import MongoDb from '../database/mongoDb';

class ValueController {
  async store(req, res) {
    const existPermission = await Permission.checksPermission(req.userId, 'insert');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }
    const { collectionName, values } = req.body;

    if (!collectionName || !values) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      if (!await mongoDb.existDb(req.company)) throw new Error('O banco de dados que está tentando acessar não existe');

      const database = client.db(req.company);
      const collection = database.collection(collectionName);
      const rule = await collection.options();

      const { properties } = rule.validator.$jsonSchema;

      if (Object.keys(properties) > Object.keys(values)) throw new Error('O objeto deve seguir as regras de validação');

      await collection.insertMany(values);

      return res.status(200).json({
        success: 'Cadastro bem sucedido',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async index(req, res) {
    const { collectionName } = req.params;
    const limit = req.params.limit || 100;

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

      if (mongoDb.existCollection(collectionName)) {
        throw new Error('Essa predefinição não existe');
      }

      const collection = database.collection(collectionName);

      const values = await collection.find({}).limit(Number(limit)).toArray();

      return res.status(200).json(values);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async delete(req, res) {
    const existPermission = await Permission.checksPermission(req.userId, 'edit');

    if (!existPermission) {
      return res.status(400).json({
        errors: 'Este usuario não possui a permissao necessaria',
      });
    }

    const { id, collectionName } = req.params;

    if (!collectionName || !id) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      const collection = client.db(req.company).collection(collectionName);

      if (!await mongoDb.existValue(id, collectionName)) {
        throw new Error(`O registro com o ID '${id}' não existe na tabela '${collectionName}`);
      }

      await collection.deleteOne({ _id: new ObjectId(id) });

      return res.json({
        success: 'Deletado com sucesso',
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

    const { id } = req.params;
    const { collectionName, values } = req.body;

    if (!collectionName || !values || !id) {
      return res.status(400).json({
        errors: 'Valores inválidos',
      });
    }

    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();

    try {
      const collection = client.db(req.company).collection(collectionName);

      if (!await mongoDb.existValue(id, collectionName)) {
        throw new Error(`O registro com o ID '${id}' não existe na tabela '${collectionName}`);
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: values },
      );

      return res.json({
        success: 'alterado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new ValueController();
