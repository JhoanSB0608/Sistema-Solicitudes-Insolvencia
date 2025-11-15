// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usamos la URI de conexión proporcionada para MongoDB Atlas
    const mongoURI = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado correctamente: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1); // Salir del proceso con error
  }
};

module.exports = connectDB;