const Conciliacion = require('../models/conciliacionModel');
const fs = require('fs');

const createConciliacion = async (req, res) => {
  try {
    if (!req.body.solicitudData) {
      return res.status(400).json({
        message: 'Missing solicitudData in request body.',
      });
    }

    const parsedData = JSON.parse(req.body.solicitudData);
    
    // If a signature file was uploaded, process it and overwrite the 'firma' field
    if (req.files && req.files.firma && req.files.firma[0]) {
      const signatureFile = req.files.firma[0];
      const fileContent = fs.readFileSync(signatureFile.path);
      const base64Image = `data:${signatureFile.mimetype};base64,${fileContent.toString('base64')}`;
      
      parsedData.firma = {
        source: 'upload',
        data: base64Image, // Storing as base64
        name: signatureFile.originalname,
        url: signatureFile.path, // also storing path for reference, though it will be deleted
      };

      fs.unlinkSync(signatureFile.path); // Clean up uploaded file from temp storage
    }
    
    const dataToSave = parsedData;
    dataToSave.user = req.user._id;

    if (req.files && req.files.anexos) {
      dataToSave.anexos = req.files.anexos.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    const conciliacion = new Conciliacion(dataToSave);
    const createdConciliacion = await conciliacion.save();
    res.status(201).json(createdConciliacion);
  } catch (error) {
    console.error('Error al crear la conciliación:', error);
    res.status(400).json({ 
        message: 'Error de validación al guardar la conciliación.', 
        error: error.errors ? Object.values(error.errors).map(e => e.message) : error.message,
        details: error.errors 
    });
  }
};

module.exports = { createConciliacion };
