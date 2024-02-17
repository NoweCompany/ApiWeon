
import path from 'path';
export default class DownloadController {
  constructor(sheetService, fieldConfig) {
    this.sheetService = sheetService
    this.fieldConfig = fieldConfig
  }
  async store(req, res) {
    try {

      const { collectionName } = req.params;
      const databaseName = req.company

      if (!collectionName) {
        return res.status(400).json({
          error: 'Envie os valores corretos',
        });
      }

      const fields = await this.fieldConfig.listFields(databaseName, collectionName);
      const values = await this.sheetService.documentsWhithCurrentField(databaseName, collectionName, fields)


      const fileName = `${databaseName}_${collectionName}_${Date.now()}.xlsx`;
      const filePath = path.resolve('uploads', fileName);

      const bufferSheet = await this.sheetService.createSheet(databaseName, collectionName, values)

      await this.sheetService.saveSheet(filePath, bufferSheet)
      this.sheetService.removeSheet(filePath)

      await req.historic.registerChange();
      return res.status(200).json({
        filePath,
        fileName,
        url: `https://apiweon.nowecompany.com.br/${fileName}`,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    try {
      const { collectionName } = req.params;
      const databaseName = req.company

      if (!collectionName) {
        return res.status(400).json({
          error: 'Envie os valores corretos',
        });
      }
      const fields = await this.fieldConfig.listFields(databaseName, collectionName);
      const headers = fields.map(fieldInf => fieldInf.currentName);

      const fileName = `${databaseName}_${collectionName}_${Date.now()}.xlsx`;
      const filePath = path.resolve('uploads', fileName);

      const bufferSheet = await this.sheetService.createHeaderSheet(databaseName, collectionName, headers)

      await this.sheetService.saveSheet(filePath, bufferSheet)


      this.sheetService.removeSheet(filePath)

      await req.historic.registerChange();
      return res.status(200).json({
        filePath,
        fileName,
        url: `https://apiweon.nowecompany.com.br/${fileName}`,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }
}


