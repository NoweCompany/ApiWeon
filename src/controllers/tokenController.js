import jwt from 'jsonwebtoken';
import User from '../models/UserModels';

class TokenController {
  async store(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          errors: ['Valores inválidos'],
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({
          errors: ['Usuario não existe'],
        });
      }

      if (!(await user.passwordIsValid(password))) {
        return res.status(401).json({
          errors: ['Senha inválida'],
        });
      }
      const { id } = user;
      const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION,
      });

      return res.json({ token, user: { nome: user.nome, id, email } });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async logado(req, res) {
    try {
      const { token } = req.body;

      const dados = jwt.verify(token, process.env.TOKEN_SECRET);
      const { id, email } = dados;

      const user = await User.findOne({ where: id, email });

      if (!user) {
        return res.status(401).json({
          errors: ['Usuário inválido'],
        });
      }

      return res.status(200).json({
        id,
        email,
      });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new TokenController();
