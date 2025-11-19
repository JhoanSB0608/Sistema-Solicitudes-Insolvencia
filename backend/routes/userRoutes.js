const express = require('express');
const router = express.Router();
const { authUser, registerUser, verifyEmail, resendVerificationEmail } = require('../controllers/userController.js');

router.post('/login', authUser);
router.post('/', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
