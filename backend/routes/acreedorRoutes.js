const express = require('express');
const router = express.Router();
const { 
  getAcreedores, 
  getAcreedorById, 
  createAcreedor, 
  updateAcreedor, 
  deleteAcreedor 
} = require('../controllers/acreedorController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Todas las rutas de acreedores ahora requieren autenticación
router.route('/').get(protect, getAcreedores).post(protect, createAcreedor);
router.route('/:id').get(protect, getAcreedorById).put(protect, updateAcreedor).delete(protect, deleteAcreedor);

module.exports = router;
