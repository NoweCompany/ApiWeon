import Permission from '../models/PermissionsModel';

export default (permissionRequired) => async (req, res, next) => {
  const existPermission = await Permission.checksPermission(req.userId, permissionRequired);

  if (!existPermission) {
    return res.status(400).json({
      errors: 'Este usuario não possui a permissao necessaria',
    });
  }

  next();
};
