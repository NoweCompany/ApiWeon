import xlsx from 'xlsx';
import busboy from 'busboy';
import {
  Long, Double, Int32,
} from 'mongodb';
import MongoDb from '../database/mongoDb';

async function insertValuesCollection(collectionName, company, values) {
  const mongoDb = new MongoDb(company);
  const client = await mongoDb.connect();

  if (!await mongoDb.existDb(company)) throw new Error('O banco de dados que está tentando acessar não existe');
  if (!await mongoDb.existCollection(collectionName)) throw new Error(`O collectionName: ${collectionName}, não existe`);

  const database = client.db(company);
  const collection = database.collection(collectionName);

  const rules = await collection.options();
  const { properties } = rules.validator.$jsonSchema;

  for (const value of values) {
    if (Object.keys(value).length <= 0) {
      throw new Error('Valores inválidos');
    }
    value.default = 0;
    value.active = true;

    for (const entriesOfValue of Object.entries(value)) {
      const keyOfDocument = entriesOfValue[0];
      const valueOfDocument = entriesOfValue[1];
      const typeOfkeyValue = properties[keyOfDocument]?.bsonType;

      if (!typeOfkeyValue) throw new Error('Valores inválidos');
      console.log(valueOfDocument);
      switch (typeOfkeyValue) {
        case 'long':
          if (String(valueOfDocument).length > 15) throw new Error('Valores inválidos, o número enviado ultrapassa o valor máximo de 15 caracteres');
          value[keyOfDocument] = Long.fromBigInt(BigInt(valueOfDocument));
          break;
        case 'date':
          value[keyOfDocument] = new Date(valueOfDocument);
          break;
        case 'double':
          value[keyOfDocument] = new Double(valueOfDocument);
          break;
        case 'int':
          value[keyOfDocument] = new Int32(valueOfDocument);
          break;
        default:
          value[keyOfDocument] = valueOfDocument;
      }
    }
  }

  try {
    await collection.insertMany(values);
  } catch (error) {
    throw new Error('Arquivo inválido, o arquivo deve seguir as validações da predefinição. Para isso baixe a planilha de exemplo.');
  }
  mongoDb.close();
  return true;
}
class UploadController {
  async store(req, res) {
    try {
      let collectionName = '';
      let mimeType = '';
      const bb = busboy({ headers: req.headers });

      bb.on('error', (error) => {
        res.status(400).json({
          errors: error,
        });
      });

      bb.on('field', (name, value) => {
        if (!name || !value || name !== 'collectionName') {
          bb.destroy('Parâmetros inválido!');
          return;
        }
        collectionName = value.trim();
      });

      bb.on('file', (fieldName, file, info) => {
        mimeType = info.mimeType;
        const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'];
        if (!allowedFileTypes.includes(mimeType)) {
          return res.status(400).json({
            errors: 'Tipo de arquivo não suportado. Envie um arquivo xlsx ou json.',
          });
        }

        const chunks = [];

        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', async () => {
          if (!collectionName) {
            bb.destroy('CollectionName não foi enviado');
          }
          if (bb.destroyed) {
            return;
          }

          const buffer = Buffer.concat(chunks);
          try {
            if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              const workbook = xlsx.read(buffer, { type: 'buffer' });
              const sheetDataJson = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
              await insertValuesCollection(collectionName, req.company, sheetDataJson);
            } else if (mimeType === 'application/json') {
              const jsonData = JSON.parse(buffer.toString());
              await insertValuesCollection(collectionName, req.company, jsonData);
            }

            return res.status(200).json({
              message: 'Arquivo recebido e processado com sucesso!',
            });
          } catch (error) {
            res.status(400).json({
              errors: error.message,
            });
          }
        });
      });

      bb.on('close', () => {
        console.log('Done parsing form!');
      });

      req.pipe(bb);
    } catch (error) {
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new UploadController();
