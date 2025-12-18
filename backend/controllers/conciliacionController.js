const Conciliacion = require('../models/conciliacionModel');
const fs = require('fs');
const path = require('path');

const { generateConciliacionPdf } = require('../utils/conciliacionDocumentGenerator');
const { generateConciliacionDocx } = require('../utils/docxGenerator');

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

    // Handle 'anexos' files by merging descriptions with file data
    const anexoInfoFromClient = parsedData.anexos ? [...parsedData.anexos] : [];
    let finalAnexos = [];
    if (req.files && req.files.anexos) {
      finalAnexos = req.files.anexos.map(file => {
        const matchingInfo = anexoInfoFromClient.find(info => info.name === file.originalname);
        return {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          descripcion: matchingInfo ? matchingInfo.descripcion : '',
        };
      });
    }
    dataToSave.anexos = finalAnexos;

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
    
    const format = req.query.format || 'pdf';

    if (format === 'pdf') {
        const buffer = await generateConciliacionPdf(solicitud);
        const filename = `conciliacion-${solicitud._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.send(buffer);
    } else if (format === 'docx') {
        const buffer = await generateConciliacionDocx(solicitud);
        const filename = `conciliacion-${solicitud._id}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.send(buffer);
    } else if (format === 'anexo') {
      try {
        const { filename } = req.query;
        if (!filename) {
          return res.status(400).json({ message: 'Nombre de archivo del anexo no especificado.' });
        }

        const anexo = solicitud.anexos.find(a => a.filename === filename);
        if (!anexo) {
          return res.status(404).json({ message: 'Anexo no encontrado.' });
        }

        const filePath = path.resolve(anexo.path);
        
        // Security check: ensure the path is within the uploads directory
        const uploadsDir = path.resolve('uploads');
        if (!filePath.startsWith(uploadsDir)) {
          return res.status(403).json({ message: 'Acceso a archivo no permitido.' });
        }

        res.download(filePath, anexo.filename, (err) => {
          if (err) {
            console.error('Error al descargar el anexo:', err);
            if (!res.headersSent) {
              if (err.code === "ENOENT") {
                return res.status(404).send({ message: "El archivo del anexo no existe en el servidor." });
              }
              res.status(500).send({ message: "No se pudo descargar el archivo." });
            }
          }
        });
      } catch (err) {
        console.error('Error procesando la descarga del anexo:', err);
        return res.status(500).json({ message: 'Error procesando la descarga del anexo', error: err.message });
      }
    } else {
        return res.status(400).json({ message: `Formato de documento no soportado: ${format}` });
    }

  } catch (error) {
    console.error('Error al generar el documento de conciliación:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al generar el documento.', error: error.message });
    }
  }
};

const getConciliacionById = async (req, res) => {
  try {
    const conciliacion = await Conciliacion.findById(req.params.id).populate('user', 'name email');
    if (conciliacion) {
      // Security check could be more robust, ensuring only user or admin can access
      // For now, allowing any authenticated user to fetch for editing purposes
      res.json(conciliacion);
    } else {
      res.status(404).json({ message: 'Solicitud de conciliación no encontrada' });
    }
  } catch (error) {
    console.error('Error fetching conciliation by ID:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const updateConciliacion = async (req, res) => {
  try {
    const conciliacion = await Conciliacion.findById(req.params.id);

    if (!conciliacion) {
      return res.status(404).json({ message: 'Solicitud de conciliación no encontrada' });
    }

    // Authorization check
    if (conciliacion.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'No autorizado para actualizar esta solicitud' });
    }
    
    const parsedData = JSON.parse(req.body.solicitudData);

    // Signature file handling
    if (req.files && req.files.firma && req.files.firma[0]) {
      const signatureFile = req.files.firma[0];
      const fileContent = fs.readFileSync(signatureFile.path);
      const base64Image = `data:${signatureFile.mimetype};base64,${fileContent.toString('base64')}`;
      parsedData.firma = {
        source: 'upload',
        data: base64Image,
        name: signatureFile.originalname,
        url: signatureFile.path,
      };
      fs.unlinkSync(signatureFile.path);
    }

    const anexoDataFromClient = parsedData.anexos;
    delete parsedData.anexos;

    Object.assign(conciliacion, parsedData);

    const newAnexosFromFiles = (req.files && req.files.anexos) || [];
    
    // Get a list of annex filenames from the client
    const clientAnexoNames = anexoDataFromClient ? anexoDataFromClient.map(a => a.name) : [];

    // Remove annexes that are no longer in the client's list
    conciliacion.anexos.slice().forEach(existingAnexo => {
        if (!clientAnexoNames.includes(existingAnexo.filename)) {
            conciliacion.anexos.id(existingAnexo._id).remove();
        }
    });

    // Update existing ones and add new ones
    if (anexoDataFromClient) {
        for (const anexoFromClient of anexoDataFromClient) {
            const existingAnexo = conciliacion.anexos.find(a => a.filename === anexoFromClient.name);
            const newFile = newAnexosFromFiles.find(f => f.originalname === anexoFromClient.name);

            if (existingAnexo) {
                // It exists, so just update the description.
                existingAnexo.descripcion = anexoFromClient.descripcion;
            } else if (newFile) {
                // It doesn't exist and it's a new file, so add it.
                conciliacion.anexos.push({
                    filename: newFile.filename,
                    path: newFile.path,
                    mimetype: newFile.mimetype,
                    size: newFile.size,
                    descripcion: anexoFromClient.descripcion,
                });
            }
        }
    }
    
    const updatedConciliacion = await conciliacion.save();
    res.json(updatedConciliacion);

  } catch (error) {
    console.error('Error updating conciliation:', error);
    res.status(400).json({ 
        message: 'Error de validación al actualizar la solicitud.', 
        error: error.errors ? Object.values(error.errors).map(e => e.message) : error.message,
        details: error.errors 
    });
  }
};

module.exports = { createConciliacion, getConciliacionDocumento, getConciliacionById, updateConciliacion };
