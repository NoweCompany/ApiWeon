import { DataTypes } from 'sequelize';
import Permission from '../models/PermissionsModel';

import sequelize from '../database/index';

const queryInterface = sequelize.getQueryInterface();

class TempleteController {
  // table
  async storeTable(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'insert');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      if (!req.company) {
        return res.status(400).json({
          errors: 'Erro',
        });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const allTable = await queryInterface.showAllTables();

      if (allTable.indexOf(name) !== -1) {
        return res.status(400).json({
          errors: 'Uma tabela com esse nome já existe',
        });
      }

      await queryInterface.createTable(name, {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
      });

      return res.json('ok');
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async indexTables(req, res) {
    try {
      // fazer validações nescessarias
      const response = [];
      console.log(req.company);
      const allTable = await queryInterface.showAllTables({ schema: 'nowe' });

      if (allTable.length <= 0) {
        return res.status(200).json({
          msg: 'Não há tabelas criadas',
        });
      }

      const defaultTables = ['users', 'permissions', 'SequelizeMeta'];

      for (const i in allTable) {
        const tableName = allTable[i];

        if (defaultTables.includes(tableName)) continue;

        const describeTable = await queryInterface.describeTable(tableName);

        const fields = [];

        for (const key in describeTable) {
          const field = { key, type: describeTable[key].type };
          fields.push(field);
        }

        const obj = { tableName, fields };

        response.push(obj);
      }

      if (response.length <= 0) {
        return res.status(200).json({
          errors: 'Não há tabelas criadas',
        });
      }

      return res.status(200).json({ response });
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async deleteTables(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'delet');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }
      const { tableName } = req.body;

      if (!tableName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }
      const record = await queryInterface.tableExists(tableName);

      if (!record) {
        return res.status(400).json({
          errors: 'Essa tabela não existe',
        });
      }

      await queryInterface.dropTable(tableName, { force: true });
      // const sql = `DROP TABLE IF EXISTS ${process.env.DATABASE}.${tableName}`;
      // await sequelize.query(sql, { type: sequelize.QueryTypes.RAW });

      return res.status(200).json(true);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async updateTables(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'edit');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }
      const { beforeName, afterName } = req.body;

      if (!beforeName || !afterName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const existeTable = await queryInterface.tableExists(beforeName);

      if (!existeTable) {
        return res.status(400).json({
          errors: 'Essa tabela não existe',
        });
      }

      await queryInterface.renameTable(beforeName, afterName);

      return res.status(200).json({
        success: 'Tabela renomeada com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  // field
  async showField(req, res) {
    try {
      const { tableName } = req.params;

      if (!tableName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      const fields = await queryInterface.describeTable(tableName);

      return res.status(200).json(fields);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async storeField(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'insert');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      const { tableName, fieldName, options } = req.body;

      if (!tableName || !fieldName || !options) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const { type, allowNull } = options;

      if (!DataTypes[type]) {
        return res.status(400).json({
          errors: 'Este tipo de campo não é válido',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }
      const tableDescribe = await queryInterface.describeTable(tableName);

      if (tableDescribe[fieldName]) {
        return res.status(400).json({
          errors: 'Este campo já existe',
        });
      }

      await queryInterface.addColumn(tableName, fieldName, {
        type: DataTypes[type],
        allowNull,
      });

      return res.json(true);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async deleteField(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'delet');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      const { tableName, fieldName } = req.body;

      if (!fieldName || !tableName) {
        return res.status(400).json({
          errors: 'Valor inválido',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      queryInterface.removeColumn(tableName, fieldName);

      return res.status(200).json(true);
    } catch (e) {
      return res.status(400).json({
        errors: 'Algo deu errado',
      });
    }
  }

  async updateField(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'edit');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      const { tableName, fieldNameBefore, fieldNameAfter } = req.body;

      if (!tableName || !fieldNameBefore || !fieldNameAfter) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      const tableDescribe = await queryInterface.describeTable(tableName);

      if (!tableDescribe[fieldNameBefore]) {
        return res.status(400).json({
          errors: 'Este campo não existe',
        });
      }

      await queryInterface.renameColumn(tableName, fieldNameBefore, fieldNameAfter);

      return res.json({
        success: 'Campo renomeado com sucesso',
      });
    } catch (e) {
      return res.status(400).json({
        errors: 'Algo deu errado',
      });
    }
  }

  // values
  async storeValues(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'insert');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }
      const { tableName, values } = req.body;

      if (!tableName || !values) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }
      // validações
      const describeTable = await queryInterface.describeTable(tableName);

      for (const key in values) {
        if (!describeTable[key]) {
          return res.status(400).json({
            errors: `O campo ${key} não exite na tabela ${tableName}`,
          });
        }
      }

      await queryInterface.bulkInsert(tableName, [values]);

      return res.json(true);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async indexValues(req, res) {
    try {
      const { tableName } = req.params;

      if (!tableName) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      const values = await queryInterface.select(null, tableName);

      return res.status(200).json(values);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async deleteValues(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'delet');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      const { tableName } = req.body;
      const { id } = req.params;

      if (!tableName || !id) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      const valueExiste = await queryInterface.select(null, tableName, { where: { id } })
        .then((values) => (!!values.length));

      if (!valueExiste) {
        return res.status(400).json({
          errors: `Não existe um valor com o id: ${id}`,
        });
      }

      await queryInterface.bulkDelete(tableName, { id });

      return res.status(200).json(true);
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }

  async updateValues(req, res) {
    try {
      const existPermission = await Permission.checksPermission(req.userId, 'edit');

      if (!existPermission) {
        return res.status(400).json({
          errors: 'Este usuario não possui a permissao necessaria',
        });
      }

      const { id } = req.params;
      const { tableName, fieldName, value } = req.body;

      if (!tableName || !fieldName || !value || !id) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const tableExist = await queryInterface.tableExists(tableName);

      if (!tableExist) {
        return res.status(400).json({
          errors: `A tabela ${tableName} não exite`,
        });
      }

      const tabela = await queryInterface.describeTable(tableName);
      if (!tabela[fieldName]) {
        return res.status(400).json({
          errors: `O campo '${fieldName}' não existe na tabela.`,
        });
      }

      const registro = await queryInterface.select(null, tableName, {
        where: { id },
      });

      if (registro.length === 0) {
        return res.status(400).json({
          errors: `O registro com o ID '${id}' não existe na tabela '${tableName}`,
        });
      }

      await queryInterface.bulkUpdate(tableName, { [fieldName]: value }, { id });

      return res.json({
        success: `campo ${fieldName} alterado com sucesso`,
      });
    } catch (e) {
      return res.status(400).json({
        errors: `Erro, ${e}`,
      });
    }
  }
}
export default new TempleteController();
