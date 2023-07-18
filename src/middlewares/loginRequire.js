import jwt from 'jsonwebtoken';
import User from '../models/UserModels';
import Company from '../models/CompanysModel';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: 'Login required',
    });
  }

  const [, token] = authorization.split(' ');

  try {
    const dados = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = dados;

    const user = await User.findOne({
      where: {
        id,
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário inválido'],
      });
    }

    const company = await Company.findOne({
      where: {
        company_user_id: user.id,
      },
    });

    if (!company) {
      return res.status(401).json({
        errors: ['Compania inválido'],
      });
    }

    req.userId = id;
    req.userEmail = email;
    req.company = company.name;
    return next();
  } catch (e) {
    return res.status(401).json({ e });
  }
};
