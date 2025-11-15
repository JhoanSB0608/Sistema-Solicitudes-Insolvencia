const express = require('express');
const router = express.Router();
const { authUser, registerUser, verifyEmail } = require('../controllers/userController.js');

router.post('/login', authUser);
router.post('/', registerUser);
router.get('/verify/:token', verifyEmail);

module.exports = router;
