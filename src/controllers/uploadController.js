import xlsx from 'xlsx';
import busboy from 'busboy';
import MongoDb from '../database/MongoDbConnection';

import FieldsConfig from '../services/fieldsconfigSevice';
import convertType from '../services/convertTypeToBsonType';

async function insertValuesCollection(collectionName, company, values) {
  const mongoDb = new MongoDb(company);
  const client = await mongoDb.connect();
  const fieldConfig = new FieldsConfig(mongoDb);

  const collection = client.db(company).collection(collectionName);

  const fieldsList = await fieldConfig.listFields(company, collectionName);

  const valuesFormated = values.map((doc) => {
    const entries = Object.entries(doc);
    const documentFormated = entries.reduce((ac, entrie) => {
      const currentName = entrie[0];
      const value = entrie[1];

      const currentFieldInf = fieldsList.find((fieldInf) => fieldInf.currentName === currentName);
      if (!currentFieldInf) throw new Error(`O campo ${currentName} não é um campo valido!`);

      const { originalName, type: typeCurrentField, required } = currentFieldInf;

      let convertedValue = null;
      if (!required && !value) {
        convertedValue = convertType(typeCurrentField, null);
      } else if (required && !value) {
        throw new Error(`O campo ${collectionName} é um campo obrigatorio, que deve ser preenchido!`);
      } else {
        convertedValue = convertType(typeCurrentField, value);
      }

      const docFormated = { ...ac, [originalName]: convertedValue };
      return docFormated;
    }, {});

    // add default key in docuemtn
    documentFormated.active = true;
    documentFormated.default = 0;

    return documentFormated;
  });

  console.log(valuesFormated);

  try {
    await collection.insertMany(valuesFormated);
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
          error: error,
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
            error: 'Tipo de arquivo não suportado. Envie um arquivo xlsx ou json.',
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
              error: error.message,
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
