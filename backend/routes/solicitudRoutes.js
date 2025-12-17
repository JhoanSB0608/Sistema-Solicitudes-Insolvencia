const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createSolicitud, 
  getSolicitudDocumento, 
  getMisSolicitudes,
  getSolicitudById,
  updateSolicitud,
  getAnexo
} = require('../controllers/solicitudController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Multer config for file uploads
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadFields = upload.fields([
  { name: 'anexos' },
  { name: 'firma', maxCount: 1 }
]);

router.route('/')
  .post(protect, uploadFields, createSolicitud)
  .get(protect, getMisSolicitudes);

router.route('/:id')
  .get(protect, getSolicitudById)
  .put(protect, uploadFields, updateSolicitud);

router.route('/:id/documento').get(protect, getSolicitudDocumento);
router.route('/:id/anexo/:filename').get(protect, getAnexo);

module.exports = router;