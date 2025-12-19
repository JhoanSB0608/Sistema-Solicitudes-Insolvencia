const Solicitud = require('../models/solicitudModel');
const fs = require('fs');
const path = require('path');
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
  console.log(`[solicitudController] updateSolicitud ${req.params.id} - received body:`, JSON.stringify(req.body, null, 2));
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
    
    // The incoming request body is now the source of truth, containing all data including GCS urls for anexos.
    const dataToUpdate = req.body;

    // Directly assign the data from the request body to the Mongoose document.
    // Mongoose is smart enough to handle the nested schemas.
    solicitud.set(dataToUpdate);
    
    // The 'anexos' array from the client contains the full, correct state of all annexes.
    // By assigning it directly, Mongoose will handle the update.
    solicitud.anexos = dataToUpdate.anexos || [];
    
    // The 'firma' object is also handled directly.
    solicitud.firma = dataToUpdate.firma;

    // Construct nombreCompleto for the deudor just in case it changed
    if (solicitud.deudor) {
      solicitud.deudor.nombreCompleto = [
        solicitud.deudor.primerNombre,
        solicitud.deudor.segundoNombre,
        solicitud.deudor.primerApellido,
        solicitud.deudor.segundoApellido
      ].filter(Boolean).join(' ');
    }

    console.log("[solicitudController] updateSolicitud - object to be saved:", JSON.stringify(solicitud.toObject(), null, 2));
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
  console.log("[solicitudController] createSolicitud - received body:", JSON.stringify(req.body, null, 2));
  try {
    // The incoming request body is now the source of truth from the client.
    const dataToSave = req.body;

    // Assign the user from the authenticated session
    dataToSave.user = req.user._id;

    // The 'anexos' and 'firma' fields are already in the correct format from the frontend,
    // including GCS URLs. No special server-side file handling is needed.

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
    console.log("[solicitudController] createSolicitud - object to be saved:", JSON.stringify(solicitud.toObject(), null, 2));
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

        // The path in the DB should be relative to the project root, e.g., 'uploads/filename.pdf'
        const filePath = path.resolve(anexo.path);
        
        // Security check: ensure the path is within the uploads directory
        // Resolve uploadsDir relative to this controller's directory (__dirname)
        const uploadsDir = path.resolve(__dirname, '../uploads');
        if (!filePath.startsWith(uploadsDir)) {
          console.warn(`Intento de acceso a archivo fuera del directorio de carga permitido: ${filePath}`);
          return res.status(403).json({ message: 'Acceso a archivo no permitido.' });
        }

        res.download(filePath, anexo.filename, (err) => {
          if (err) {
            console.error(`Error al descargar el anexo "${anexo.filename}" (ID: ${solicitud._id}):`, err);
            console.error(`Ruta del archivo intentada: ${filePath}, Código de error: ${err.code}`);
            if (!res.headersSent) {
              // ENOENT is a common error if the file is missing from the server
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
    console.error('Error al generar el documento:', error);
    // This outer catch handles errors like the solicitud not being found or database issues.
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al generar el documento.', error: error.message, stack: error.stack });
    }
  }
};

module.exports = { createSolicitud, getSolicitudDocumento, getMisSolicitudes, getSolicitudById, updateSolicitud };