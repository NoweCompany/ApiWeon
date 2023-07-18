import { Sequelize } from 'sequelize';
import User from '../models/UserModels';
import Permission from '../models/PermissionsModel';
import Company from '../models/CompanysModel';

import dbConfig from '../config/dbConfig';

const conect = new Sequelize(dbConfig);

async function virifyConect(sequelize) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

virifyConect(conect);

User.init(conect);
Company.init(conect);
Permission.init(conect);

Permission.associate(conect.models);
Company.associate(conect.models);
User.associate(conect.models);

export default conect;
