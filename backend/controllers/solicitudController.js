const Solicitud = require('../models/solicitudModel');
const { generateSolicitudPdf } = require('../utils/documentGenerator');

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

    // Update fields
    Object.assign(solicitud, parsedData);

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newAnexos = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
      solicitud.anexos = solicitud.anexos ? [...solicitud.anexos, ...newAnexos] : newAnexos;
    }
    
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

    // For debugging, return the received body if solicitudData is missing
    if (!req.body.solicitudData) {
      return res.status(400).json({
        message: 'Missing solicitudData in request body.',
        receivedBody: req.body,
        receivedFiles: req.files,
      });
    }

    // Parse the JSON string from the solicitudData field
    const parsedData = JSON.parse(req.body.solicitudData);

    // Start with the parsed data as the base
    const dataToSave = parsedData;

    // Add properties that are not in the parsedData (user from auth, tipoSolicitud from body)
    dataToSave.user = req.user._id;
    if (req.body.tipoSolicitud) {
      dataToSave.tipoSolicitud = req.body.tipoSolicitud;
    }

    // Handle file uploads from multer
    if (req.files && req.files.length > 0) {
      dataToSave.anexos = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
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
    const { tipoSolicitud } = solicitud;

if (format === 'pdf') {
    try {
      const buffer = await generateSolicitudPdf(solicitud);
      // Diagnóstico
      const bufLen = buffer && (buffer.length || buffer.byteLength) ? (buffer.length || buffer.byteLength) : Buffer.byteLength(Buffer.from(buffer || []));

      if (!buffer || bufLen === 0) {
        return res.status(500).json({ message: 'No se generó el contenido del PDF' });
      }

      const filename = `solicitud-${solicitud._id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.setHeader('Content-Length', String(bufLen));
      return res.end(buffer);
    } catch (err) {
      console.error('Error generando PDF de Insolvencia:', err);
      return res.status(500).json({ message: 'Error generando el documento PDF', error: err.message, stack: err.stack });
    }
  } else {
    // si generateGenericPdf devuelve buffer en lugar de escribir en res, deberías hacer lo mismo:
    if (genericPdfMap[tipoSolicitud]) {
      // Si generateGenericPdf ya escribe en `res`, no lo cambies. Si devuelve buffer, asegúrate de enviar buffer y headers.
      res.setHeader('Content-Type', 'application/pdf');
      const filename = `solicitud-${solicitud._id}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      // Si generateGenericPdf escribe en res: llamar y retornar. Si devuelve buffer, enviar buffer.
      return generateGenericPdf(solicitud, genericPdfMap[tipoSolicitud], res);
    } else {
      return res.status(400).json({ message: 'Tipo de solicitud no tiene un generador de PDF.' });
    }
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
