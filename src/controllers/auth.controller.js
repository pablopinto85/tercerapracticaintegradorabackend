const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  // Configuración del servicio de correo (ejemplo: Gmail)
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña',
  },
});

// Endpoint para solicitar recuperación de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Verifica si el usuario existe
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crea un token con expiración de 1 hora
    const token = jwt.sign({ userId: user._id }, 'tu_secreto', { expiresIn: '1h' });

    // Envía el correo con el enlace de recuperación
    await transporter.sendMail({
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `<a href="http://tu_app.com/reset-password/${token}">Restablecer Contraseña</a>`,
    });

    res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
