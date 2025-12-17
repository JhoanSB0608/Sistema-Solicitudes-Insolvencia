const Solicitud = require('../models/solicitudModel');
const fs = require('fs');
const path = require('path');
const { generateSolicitudPdf } = require('../utils/documentGenerator');
const { generateSolicitudDocx } = require('../utils/docxGenerator');

const getAnexo = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id).populate('user');

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Security check
    if (!solicitud.user || (solicitud.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(401).json({ message: 'No autorizado para ver este documento' });
    }
    
    const anexo = solicitud.anexos.find(a => a.filename === req.params.filename);

    if (!anexo || !anexo.dataUrl) {
        return res.status(404).json({ message: 'Anexo no encontrado o no contiene datos.' });
    }

    // Decode the base64 data URL
    const parts = anexo.dataUrl.split(';base64,');
    const mimeType = parts[0].split(':')[1];
    const fileContents = Buffer.from(parts[1], 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(anexo.filename)}`);
    res.send(fileContents);

  } catch (error) {
    console.error('Error al obtener el anexo:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al obtener el anexo.', error: error.message });
    }
  }
};

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

    // Security check
    if (solicitud.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'No autorizado para actualizar esta solicitud' });
    }
    
    const parsedData = JSON.parse(req.body.solicitudData);

    // Signature file handling from memory buffer
    if (req.files && req.files.firma && req.files.firma[0]) {
      const signatureFile = req.files.firma[0];
      solicitud.firma = {
        source: 'upload',
        name: signatureFile.originalname,
        dataUrl: `data:${signatureFile.mimetype};base64,${signatureFile.buffer.toString('base64')}`,
      };
    } else if (parsedData.firma) {
      solicitud.firma = parsedData.firma;
    }
    solicitud.markModified('firma');

    // Assign other top-level fields
    const fieldsToUpdate = [
      'deudor', 'sede', 'causas', 'acreencias', 'bienesMuebles', 
      'bienesInmuebles', 'noPoseeBienes', 'informacionFinanciera', 
      'sociedadConyugal', 'propuestaPago', 'projectionData'
    ];
    fieldsToUpdate.forEach(field => {
      if (parsedData[field] !== undefined) {
        solicitud[field] = parsedData[field];
        solicitud.markModified(field);
      }
    });

    // --- Robust Anexos Sync Logic (Store in DB from Memory) ---
    const newAnexosFromFiles = (req.files && req.files.anexos) || [];
    const anexoDataFromClient = parsedData.anexos || [];
    const clientAnexoFilenames = anexoDataFromClient.map(a => a.name);

    // 1. Filter out deleted annexes
    solicitud.anexos = solicitud.anexos.filter(existingAnexo => 
        clientAnexoFilenames.includes(existingAnexo.filename)
    );

    // 2. Update descriptions
    solicitud.anexos.forEach(existingAnexo => {
        const anexoFromClient = anexoDataFromClient.find(a => a.name === existingAnexo.filename);
        if (anexoFromClient) {
            existingAnexo.descripcion = anexoFromClient.descripcion;
        }
    });

    // 3. Add new annexes (from memory buffer)
    newAnexosFromFiles.forEach(newFile => {
        const anexoFromClient = anexoDataFromClient.find(a => a.name === newFile.originalname);
        if (anexoFromClient) {
            const dataUrl = `data:${newFile.mimetype};base64,${newFile.buffer.toString('base64')}`;
            solicitud.anexos.push({
                filename: newFile.originalname,
                mimetype: newFile.mimetype,
                size: newFile.size,
                descripcion: anexoFromClient.descripcion,
                dataUrl: dataUrl,
            });
        }
    });
    
    solicitud.markModified('anexos');
    
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
    
    // Handle firma file from memory buffer
    if (req.files && req.files.firma && req.files.firma[0]) {
      const signatureFile = req.files.firma[0];
      parsedData.firma = {
        source: 'upload',
        name: signatureFile.originalname,
        dataUrl: `data:${signatureFile.mimetype};base64,${signatureFile.buffer.toString('base64')}`,
      };
    }
    
    const dataToSave = parsedData;
    dataToSave.user = req.user._id;

    // Handle 'anexos' files from memory buffer
    if (req.files && req.files.anexos) {
      const anexoInfoFromClient = parsedData.anexos || [];
      dataToSave.anexos = req.files.anexos.map(file => {
        const matchingInfo = anexoInfoFromClient.find(info => info.name === file.originalname);
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        return {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          descripcion: matchingInfo ? matchingInfo.descripcion : '',
          dataUrl: dataUrl,
        };
      });
    } else {
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

module.exports = { createSolicitud, getSolicitudDocumento, getMisSolicitudes, getSolicitudById, updateSolicitud, getAnexo };