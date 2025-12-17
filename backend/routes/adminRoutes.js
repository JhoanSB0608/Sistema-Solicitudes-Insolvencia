const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getStats, getSolicitudes, uploadAnexo } = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Multer config for file uploads
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Todas las rutas de admin requieren autenticación y rol de administrador
router.get('/stats', protect, admin, getStats);
router.get('/solicitudes', protect, admin, getSolicitudes);

// Route for uploading a new anexo from the admin panel
router.post('/upload-anexo/:tipo/:id', protect, admin, upload.single('anexo'), uploadAnexo);


module.exports = router;
