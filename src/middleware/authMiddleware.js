const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'tu_secreto');
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Autenticación fallida' });
  }
};
