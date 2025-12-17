const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  createSolicitud, 
  getSolicitudDocumento, 
  getMisSolicitudes,
  getSolicitudById,
  updateSolicitud
} = require('../controllers/solicitudController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

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

module.exports = router;