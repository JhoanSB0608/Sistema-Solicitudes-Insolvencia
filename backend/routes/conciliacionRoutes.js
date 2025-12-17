const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createConciliacion, getConciliacionDocumento, getConciliacionById, updateConciliacion, getConciliacionAnexo } = require('../controllers/conciliacionController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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
  .post(protect, uploadFields, createConciliacion);

router.route('/:id')
    .get(protect, getConciliacionById)
    .put(protect, uploadFields, updateConciliacion);

router.route('/:id/documento').get(protect, getConciliacionDocumento);
router.route('/:id/anexos/:filename').get(protect, getConciliacionAnexo);

module.exports = router;
