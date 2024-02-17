import xlsx from 'xlsx';
import fs from 'fs'

class SheetService {
  constructor(clientMongoDb) {
    //remover se não necessário
    this.client = clientMongoDb;
  }

  async documentsWhithCurrentField(databaseName, collectionName, fields) {
    const databaseRef = this.client.db(databaseName)
    const collection = databaseRef.collection(collectionName)

    const project = fields.reduce((ac, field) => {
      const { originalName, currentName } = field

      ac[currentName] = `$${originalName}`
      return ac
    }, {})

    project._id = 0

    const pipeliine = [
      {
        $project: project
      }
    ]
    const values = await collection.aggregate(pipeliine).toArray()

    return values
  }

  async createHeaderSheet(databaseName, collectionName, headers) {
    try {
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet([]);
      xlsx.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      xlsx.utils.book_append_sheet(wb, ws, `${databaseName}_${collectionName}`);

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return buffer
    } catch (error) {
      console.error('Erro ao criar header da planilha:', error);
      throw new Error('Erro ao criar header da planilha');
    }
  }

  async createSheet(databaseName, collectionName, values) {
    try {

      const ws = xlsx.utils.json_to_sheet(values);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, `${databaseName}_${collectionName}`);

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return buffer;
    } catch (error) {
      console.error('Erro ao criar a planilha:', error);
      throw new Error('Erro ao criar a planilha');
    }
  }

  async saveSheet(filePath, buffer) {
    try {
      await new Promise((resolve, reject) => {
        fs.writeFile(filePath, new Buffer(buffer), (err) => {
          if (err) {
            console.error('Ocorreu um erro ao gravar o arquivo:', err);
            reject(err);
          } else {
            console.log('Arquivo gravado com sucesso:', filePath);
            resolve(filePath);
          }
        });
      });
    } catch (error) {
      console.error('Erro ao gravar o arquivo:', error);
      throw new Error('Erro ao gravar o arquivo');
    }
  }

  removeSheet(filePath) {
    try {
      setTimeout(() => {
        fs.unlinkSync(filePath)
        console.log('Planilha excluída com sucesso:', filePath);
      }, 10000)
    } catch (error) {
      console.log('Não foi possível exluir planilha');
    }
  }
}

export default SheetService;
