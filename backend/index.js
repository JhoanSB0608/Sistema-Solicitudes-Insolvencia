if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
  };
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');
const acreedorRoutes = require('./routes/acreedorRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');

const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Passport config
require('./config/passport')(passport);


// Conectar a la base de datos
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000'
    ],
    credentials: true,
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type'],
  })
);

app.use(express.json());

// Passport middleware
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

app.use('/api/acreedores', acreedorRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
