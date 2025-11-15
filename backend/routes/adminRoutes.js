const express = require('express');
const router = express.Router();
const { getStats, getSolicitudes } = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Todas las rutas de admin requieren autenticación y rol de administrador
router.get('/stats', protect, admin, getStats);
router.get('/solicitudes', protect, admin, getSolicitudes);

module.exports = router;
