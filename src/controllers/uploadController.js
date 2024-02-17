import xlsx from 'xlsx';
import busboy from 'busboy';
import path from 'path';

export default class UploadController {
  constructor(fieldconfigService, valueService) {
    this.fieldconfigService = fieldconfigService
    this.valueService = valueService
  }
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
            const databaseName = req.company
            let jsonData = []

            if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              const fields = (await this.fieldconfigService.listFields(databaseName, collectionName))
                .map((field) => field.originalName)

              const workbook = xlsx.read(buffer)
              const firstSheetName = workbook.SheetNames[0];
              const workSheet = workbook.Sheets[firstSheetName]

              xlsx.utils.sheet_add_aoa(workSheet, [fields], { origin: "A1" })
              jsonData = xlsx.utils.sheet_to_json(workSheet)
            } else if (mimeType === 'application/json') {
              jsonData = JSON.parse(buffer.toString());
            }

            const valuesFomated = await this.valueService.formateValueToInsert(databaseName, collectionName, jsonData)
            await this.valueService.insertValues(databaseName, collectionName, valuesFomated)

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
