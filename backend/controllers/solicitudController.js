const Solicitud = require('../models/solicitudModel');
const fs = require('fs');
const { generateSolicitudPdf } = require('../utils/documentGenerator');
const { generateSolicitudDocx } = require('../utils/docxGenerator');

const getSolicitudById = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id).populate('user', 'name email');
    if (solicitud) {
      // Security check: User can only access their own documents unless they are an admin
      if (solicitud.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: 'No autorizado para ver esta solicitud' });
      }
      res.json(solicitud);
    } else {
      res.status(404).json({ message: 'Solicitud no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la solicitud:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const updateSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Security check: User can only update their own documents unless they are an admin
    if (solicitud.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'No autorizado para actualizar esta solicitud' });
    }
    
    const parsedData = JSON.parse(req.body.solicitudData);

    // If a new signature file was uploaded, process it and overwrite the 'firma' field in parsedData
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
      
      // Clean up the uploaded file as it's now stored as base64
      fs.unlinkSync(signatureFile.path);
    }

    // Update fields by assigning the (potentially modified) parsedData
    const anexoDataFromClient = parsedData.anexos;
    delete parsedData.anexos; // <- Crucial step

    // Update all scalar fields etc.
    Object.assign(solicitud, parsedData);

    // Now, handle the anexos array carefully
    const finalAnexos = [];
    if (anexoDataFromClient) {
        const newAnexosFromFiles = (req.files && req.files.anexos) || [];

        for (const anexoFromClient of anexoDataFromClient) {
            // Find if it's a newly uploaded file
            const newFile = newAnexosFromFiles.find(f => f.originalname === anexoFromClient.name);
            
            if (newFile) {
                // Yes, it's a new file. Create a new object for it.
                finalAnexos.push({
                    filename: newFile.filename,
                    path: newFile.path,
                    mimetype: newFile.mimetype,
                    size: newFile.size,
                    descripcion: anexoFromClient.descripcion,
                });
            } else {
                // No, it's an existing file. Find it in the DB record.
                const existingAnexo = solicitud.anexos.find(a => a.filename === anexoFromClient.name);
                if (existingAnexo) {
                    // Found it. Preserve its data and update the description.
                    const anexoObject = existingAnexo.toObject();
                    anexoObject.descripcion = anexoFromClient.descripcion;
                    finalAnexos.push(anexoObject);
                }
            }
        }
    }
    // Replace the old array with the newly constructed one.
    solicitud.anexos = finalAnexos;
    
    // Construct nombreCompleto for the deudor
    if (solicitud.deudor) {
      solicitud.deudor.nombreCompleto = [
        solicitud.deudor.primerNombre,
        solicitud.deudor.segundoNombre,
        solicitud.deudor.primerApellido,
        solicitud.deudor.segundoApellido
      ].filter(Boolean).join(' ');
    }

    const updatedSolicitud = await solicitud.save();
    res.json(updatedSolicitud);

  } catch (error) {
    console.error('Error al actualizar la solicitud:', error);
    res.status(400).json({ 
        message: 'Error de validación al actualizar la solicitud.', 
        error: error.errors ? Object.values(error.errors).map(e => e.message) : error.message,
        details: error.errors 
    });
  }
};


const getMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener las solicitudes del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const createSolicitud = async (req, res) => {
  try {

    if (!req.body.solicitudData) {
      return res.status(400).json({
        message: 'Missing solicitudData in request body.',
        receivedBody: req.body,
        receivedFiles: req.files,
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
        data: base64Image,
        name: signatureFile.originalname,
        url: signatureFile.path,
      };

      // Clean up the uploaded file as it's now stored as base64
      fs.unlinkSync(signatureFile.path);
    }
    
    // Start with the parsed data as the base
    const dataToSave = parsedData;

    // Add properties that are not in the parsedData
    dataToSave.user = req.user._id;
    if (req.body.tipoSolicitud) {
      dataToSave.tipoSolicitud = req.body.tipoSolicitud;
    }

    // Handle 'anexos' files
    if (req.files && req.files.anexos) {
      const anexoInfoFromClient = parsedData.anexos || [];
      dataToSave.anexos = req.files.anexos.map(file => {
        const matchingInfo = anexoInfoFromClient.find(info => info.name === file.originalname);
        return {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          descripcion: matchingInfo ? matchingInfo.descripcion : '',
        };
      });
    } else {
      // If no files are attached, ensure 'anexos' is not the placeholder from the client
      dataToSave.anexos = [];
    }

    // Construct nombreCompleto for the deudor
    if (dataToSave.deudor) {
      dataToSave.deudor.nombreCompleto = [
        dataToSave.deudor.primerNombre,
        dataToSave.deudor.segundoNombre,
        dataToSave.deudor.primerApellido,
        dataToSave.deudor.segundoApellido
      ].filter(Boolean).join(' ');
    }

    const solicitud = new Solicitud(dataToSave);
    const createdSolicitud = await solicitud.save();
    res.status(201).json(createdSolicitud);
  } catch (error) {
    console.error('Error al crear la solicitud:', error);
    res.status(400).json({ 
        message: 'Error de validación al guardar la solicitud.', 
        error: error.errors ? Object.values(error.errors).map(e => e.message) : error.message,
        details: error.errors 
    });
  }
};
const getSolicitudDocumento = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id).populate('acreencias.acreedor user');

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Security check: User can only access their own documents unless they are an admin
    if (!solicitud.user || (solicitud.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(401).json({ message: 'No autorizado para ver este documento' });
    }

    const format = req.query.format || 'pdf';

    if (format === 'pdf') {
      try {
        const buffer = await generateSolicitudPdf(solicitud);
        const filename = `solicitud-${solicitud._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.send(buffer);
      } catch (err) {
        console.error('Error generando PDF de Insolvencia:', err);
        return res.status(500).json({ message: 'Error generando el documento PDF', error: err.message, stack: err.stack });
      }
    } else if (format === 'docx') {
      try {
        const buffer = await generateSolicitudDocx(solicitud);
        const filename = `solicitud-${solicitud._id}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.send(buffer);
      } catch (err) {
        console.error('Error generando DOCX de Insolvencia:', err);
        return res.status(500).json({ message: 'Error generando el documento DOCX', error: err.message, stack: err.stack });
      }
    } else {
      return res.status(400).json({ message: `Formato de documento no soportado: ${format}` });
    }
  } catch (error) {
    console.error('Error al generar el documento:', error);
    // This outer catch handles errors like the solicitud not being found or database issues.
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al generar el documento.', error: error.message, stack: error.stack });
    }
  }
};

module.exports = { createSolicitud, getSolicitudDocumento, getMisSolicitudes, getSolicitudById, updateSolicitud };