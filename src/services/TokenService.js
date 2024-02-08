import jwt from 'jsonwebtoken';

export default class TokenService {
  constructor(UserModel) {
    this.UserModel = UserModel;
  }

  async verifyIfUserIsValid(email) {
    try {
      const user = await this.UserModel.findOne({
        where: { email },
        include: [{
          association: 'userCompany',
          attributes: {},
        }, {
          association: 'permission',
          attributes: {},
        }],
      });
      if (!user) {
        return false;
      }

      return user;
    } catch (error) {
      throw new Error({
        error: 'Error ao validar o usuário',
      });
    }
  }

  async verifyUserPassword(user, password) {
    try {
      if (!(await user.passwordIsValid(password))) {
        return false;
      }
      return true;
    } catch (error) {
      throw Error({
        error: 'Error ao verificar senha do usuário',
      });
    }
  }

  async generateToken(id, email) {
    try {
      const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION,
      });

      return token;
    } catch (error) {
      throw new Error({
        error: 'Erro ao gerar token do usuário',
      });
    }
  }

  verifyToken(token) {
    const userData = jwt.verify(token, process.env.TOKEN_SECRET);
    const { email, id } = userData;
    return { email, id };
  }
}
