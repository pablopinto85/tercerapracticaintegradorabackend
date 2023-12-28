const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const productController = require('../controllers/products.controller.js');

// Rutas de recuperación de contraseña
router.post('/request-password-reset', authController.requestPasswordReset);

// Rutas de productos
router.delete('/products/:productId', productController.deleteProduct);

module.exports = router;
