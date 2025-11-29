const Conciliacion = require('../models/conciliacionModel');
const fs = require('fs');

const { generateConciliacionPdf } = require('../utils/conciliacionDocumentGenerator');

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

const getConciliacionDocumento = async (req, res) => {
  try {
    const solicitud = await Conciliacion.findById(req.params.id).populate('user');

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud de conciliación no encontrada' });
    }

    // Security check
    if (!solicitud.user || (solicitud.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(401).json({ message: 'No autorizado para ver este documento' });
    }

    const buffer = await generateConciliacionPdf(solicitud);
    const filename = `conciliacion-${solicitud._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);

  } catch (error) {
    console.error('Error al generar el documento de conciliación:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al generar el documento.', error: error.message });
    }
  }
};

module.exports = { createConciliacion, getConciliacionDocumento };
