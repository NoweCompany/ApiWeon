import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import MongoDb from '../database/mongoDb';

dotenv.config();

class TableController {
  async index(req, res) {
    const mongoDb = new MongoDb(req.company);
    const connection = await mongoDb.connect();
    try {
      await mongoDb.existDb(req.company);

      const database = connection.db(mongoDb.database);

      const registers = await database.collection('historic').find().toArray();

      if (registers.length <= 0) return res.status(200).json({ msg: 'Não há registros.' });

      return res.status(200).json({ registers });
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async show(req, res) {
    const mongoDb = new MongoDb(req.company);
    const connection = await mongoDb.connect();
    const { id } = req.params;
    if (!id) {
      throw new Error('Envie os valores corretos');
    }
    try {
      await mongoDb.existDb(req.company);
      const database = connection.db(mongoDb.database);

      const registers = await database.collection('historic').findOne({ _id: new ObjectId(id) });

      if (!registers) return res.status(200).json({ msg: 'Esse registro não existe.' });

      return res.status(200).json(registers);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }

  async delete(req, res) {
    const mongoDb = new MongoDb(req.company);
    const connection = await mongoDb.connect();
    const { id } = req.params;
    if (!id) {
      throw new Error('Envie os valores corretos');
    }
    try {
      await mongoDb.existDb(req.company);
      const database = connection.db(mongoDb.database);

      const registers = await database.collection('historic').deleteOne({ _id: new ObjectId(id) });
      if (!registers) return res.status(200).json({ msg: 'Esse registro não existe.' });

      return res.status(200).json(true);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }
}

export default new TableController();
