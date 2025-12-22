const express = require('express');
const router = express.Router();
const {
  createArchiverEntry,
  getArchiverEntries,
  getArchiverEntryById,
  uploadArchiverAnexo,
} = require('../controllers/archiverController');
const { protect } = require('../middleware/authMiddleware');

// All archiver routes require authentication
router.route('/')
  .post(protect, createArchiverEntry)
  .get(protect, getArchiverEntries);

router.route('/:id')
  .get(protect, getArchiverEntryById);

router.route('/:id/anexos')
  .post(protect, uploadArchiverAnexo);

module.exports = router;
