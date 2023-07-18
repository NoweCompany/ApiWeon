import { Model, DataTypes } from 'sequelize';

export default class Company extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        unique: {
          msg: 'Este usuário já pertence a uma compania',
        },
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: {
          msg: 'Essa compania já foi cadastrada',
        },
      },
    }, {
      sequelize,
      tableName: 'companys',
    });
  }

  static associate(models) {
    this.belongsTo(
      models.User,
      {
        constraints: true,
        foreignKey: {
          type: DataTypes.INTEGER,
          name: 'company_user_id',
          allowNull: false,
        },
        as: 'userCompany',
      },
    );
  }
}
