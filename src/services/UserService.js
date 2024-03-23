export default class UserService {
  constructor(dbConnnection, UserModel, CompanyModel, PermissionModel) {
    this.dbConnnection = dbConnnection;

    this.User = UserModel;
    this.Company = CompanyModel;
    this.Permission = PermissionModel;
  }

  validateInput(...inputs) {
    try {
      return inputs.every((input) => input !== undefined && input !== null && input !== '');
    } catch (error) {
      throw new Error('Erro ao validar entrada de dados');
    }
  }

  async isEmailInUse(email) {
    try {
      const user = await this.User.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      throw new Error('Erro ao verificar se o email está em uso');
    }
  }

  async createUser(email, password, company, permission) {
    const t = await this.dbConnnection.transaction();
    try {
      const companyFormatted = String(company).trim().toLowerCase();
      const newUser = await this.User.create({ email, password }, { t });
      const { id: userId } = newUser;

      await this.Company.create({ name: companyFormatted, company_user_id: userId }, { t });

      const {
        adm, insert, edit, delet,
      } = permission;
      await this.Permission.create({
        id: userId, adm, insert, edit, delet, user_id: userId,
      }, { t });

      await t.commit();

      return userId;
    } catch (error) {
      console.log(error);
      await t.rollback();
      throw new Error('Erro ao criar usuário');
    }
  }

  async findUsersByCompany(company) {
    try {
      return await this.User.findAll({
        include: [
          {
            model: this.Company,
            as: 'userCompany',
            where: { name: company },
          },
          {
            model: this.Permission,
            as: 'permission',
          },
        ],
        attributes: {
          exclude: ['password_hash'],
        },
      });
    } catch (error) {
      throw new Error('Erro ao buscar usuários por empresa');
    }
  }

  async findUserById(userId) {
    try {
      const user = await this.User.findByPk(userId, {
        include: [
          { model: this.Company, as: 'userCompany' },
          { model: this.Permission, as: 'permission' },
        ],
      });

      return user;
    } catch (error) {
      throw new Error('Erro ao buscar usuário pelo ID');
    }
  }

  async updateUserData(user, newData) {
    try {
      if (!user) return null;
      return await user.update(newData);
    } catch (error) {
      throw new Error('Erro ao atualizar dados do usuário');
    }
  }

  async findCompanyByUserId(userId) {
    try {
      const company = await this.Company.findOne({ where: { company_user_id: userId } });
      if (!company) return null;
      return company;
    } catch (error) {
      throw new Error('Erro ao buscar compania pelo ID do usuário');
    }
  }

  validateCompany(company, reqCompany) {
    if (company !== reqCompany) {
      return false;
    }
    return true;
  }

  validatePassword(password) {
    if (String(password).length < 6 || String(password) > 50) {
      return 'A senha precisa ter entre 6 e 50 caracteres'
    }

    return null
  }
}
