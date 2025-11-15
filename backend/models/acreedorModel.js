const mongoose = require('mongoose');

const acreedorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nombre: { type: String, required: true },
  tipoDoc: { type: String, required: true }, // Nuevo campo
  nitCc: { type: String, required: true }, // Se elimina la restricción unique global
  direccion: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  pais: { type: String, required: true },
  departamento: { type: String, required: true },
  ciudad: { type: String, required: true },
}, { timestamps: true });

// Crear un índice compuesto para asegurar que nitCc sea único por usuario
acreedorSchema.index({ user: 1, nitCc: 1 }, { unique: true });

const Acreedor = mongoose.model('Acreedor', acreedorSchema);

module.exports = Acreedor;
