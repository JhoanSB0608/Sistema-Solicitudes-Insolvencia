const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Import nodemailer

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// Helper function to send verification email
const sendVerificationEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `${process.env.BACKEND_URL}/api/users/verify/${user.verificationToken}`;

  const mailOptions = {
    from: `"SystemLex" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verifica tu correo electrónico - SystemLex',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0B57A0 0%, #1e88e5 50%, #64b5f6 100%); min-height: 100vh;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <!-- Contenedor principal con efecto glassmorphism -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px 0 rgba(11, 87, 160, 0.37); overflow: hidden;">
                
                <!-- Header con logo -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px; background: rgba(255, 255, 255, 0.1);">
                    <img src="cid:logo" alt="SystemLex Logo" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
                
                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Título -->
                    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #ffffff; text-align: center; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      ¡Bienvenido a SystemLex!
                    </h1>
                    
                    <!-- Saludo -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #ffffff; text-align: center;">
                      Hola <strong>${user.name}</strong>,
                    </p>
                    
                    <!-- Mensaje principal -->
                    <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.7; color: #f5f5f5; text-align: center;">
                      Gracias por registrarte en nuestra plataforma. Para completar tu registro y comenzar a disfrutar de todos nuestros servicios, necesitamos verificar tu dirección de correo electrónico.
                    </p>
                    
                    <!-- Botón de verificación con glassmorphism -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 50px; border: 2px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 15px 0 rgba(11, 87, 160, 0.4); transition: all 0.3s ease;">
                                <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                  Verificar mi cuenta
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info adicional -->
                    <div style="margin: 30px 0 0 0; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.2);">
                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #ffffff; text-align: center;">
                        ⏱️ <strong>Este enlace expirará en 1 hora</strong>
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #f0f0f0; text-align: center;">
                        Por tu seguridad, te recomendamos verificar tu cuenta lo antes posible.
                      </p>
                    </div>
                    
                    <!-- Enlace alternativo -->
                    <p style="margin: 25px 0 0 0; font-size: 13px; line-height: 1.6; color: #e3f2fd; text-align: center;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="margin: 10px 0 0 0; padding: 12px; background: rgba(0, 0, 0, 0.1); border-radius: 8px; word-break: break-all; font-size: 12px; color: #ffffff; text-align: center;">
                      ${verificationLink}
                    </p>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background: rgba(11, 87, 160, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.2);">
                    <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.6; color: #e3f2fd; text-align: center;">
                      Si no te registraste en SystemLex, puedes ignorar este correo de forma segura.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #b3d9ff; text-align: center;">
                      © ${new Date().getFullYear()} SystemLex. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'logoPrincipal.png',
        path: './public/logoPrincipal.png', // Ruta relativa desde donde se ejecuta el script
        cid: 'logo' // Identificador para usar en el HTML con src="cid:logo"
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if user is verified
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  try {
    const user = new User({
      name,
      email,
      password,
      isAdmin: true, // All new users are admins as per request
      isVerified: false, // New users are not verified by default
    });

    // Generate verification token
    user.generateVerificationToken();
    console.log('Generated verification token:', user.verificationToken);
    console.log('Token expires at:', new Date(user.verificationTokenExpires));

    const createdUser = await user.save();
    console.log('User saved with token:', createdUser.verificationToken);

    // Send verification email
    await sendVerificationEmail(createdUser);
  
    if (createdUser) {
      res.status(201).json({
        message: 'Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.',
        userId: createdUser._id,
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log('Received verification token:', token);

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    console.log('User found by token:', user ? user.email : 'None');
    console.log('Current time:', new Date(Date.now()));

    if (!user) {
      console.log('Verification failed: User not found or token expired.');
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=Token inválido o expirado.`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success`);
  } catch (error) {
    console.error('Error al verificar correo electrónico:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=Error interno del servidor.`);
  }
};

module.exports = { authUser, registerUser, verifyEmail };
