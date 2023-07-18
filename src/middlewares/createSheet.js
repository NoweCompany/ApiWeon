import dotenv from 'dotenv';
import XlsxPopulate from 'xlsx-populate';
import path from 'path';
import MongoDb from '../database/mongoDb';
import Permission from '../models/PermissionsModel';

dotenv.config();

export default async (req, res, next) => {
  const existPermission = await Permission.checksPermission(req.userId, 'insert');

  if (!existPermission) {
    return res.status(400).json({
      errors: 'Este usuario não possui a permissao necessaria',
    });
  }

  const mongoDb = new MongoDb(req.company);
  const client = await mongoDb.connect();

  try {
    const existDb = await mongoDb.existDb(req.company);

    if (!existDb) {
      return res.status(400).json({
        errors: 'O bancos de dados q ue vc esta tentando acessar não existe',
      });
    }

    const { collectionName } = req.params;
    const collectionExist = await mongoDb.collectionExist(collectionName);

    if (!collectionName || !collectionExist) {
      return res.status(400).json({
        errors: 'Envie os valores corretos',
      });
    }

    const workbook = await XlsxPopulate.fromBlankAsync();

    const database = client.db(req.company);
    const collection = database.collection(collectionName);

    const values = await collection.find({}).toArray();

    const sheet = workbook.sheet(0);

    const headers = Object.keys(values[0]);
    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).value(header);
    });

    // Escreve os dados dos objetos nas células
    values.forEach((objeto, rowIndex) => {
      Object.values(objeto).forEach((value, columnIndex) => {
        sheet.cell(rowIndex + 2, columnIndex + 1).value(String(value));
      });
    });

    const fileName = `${req.company}_${collectionName}.xlsx`;
    const filePath = path.resolve(__dirname, '..', '..', 'uploads', fileName);

    await workbook.toFileAsync(filePath);

    req.body = filePath;
    return next();
  } catch (e) {
    return res.status(400).json({
      errors: 'Ocorreu um erro inesperado',
    });
  } finally {
    mongoDb.close();
  }
};
