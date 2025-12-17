const Conciliacion = require('../models/conciliacionModel');
const fs = require('fs');
const path = require('path');

const { generateConciliacionPdf } = require('../utils/conciliacionDocumentGenerator');
const { generateConciliacionDocx } = require('../utils/docxGenerator');

const getAnexo = async (req, res) => {
  try {
    const solicitud = await Conciliacion.findById(req.params.id).populate('user');

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Security check
    if (!solicitud.user || (solicitud.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(401).json({ message: 'No autorizado para ver este documento' });
    }
    
    const anexo = solicitud.anexos.find(a => a.filename === req.params.filename);

    if (!anexo) {
        return res.status(404).json({ message: 'Anexo no encontrado' });
    }

    const filePath = path.resolve(__dirname, '..', anexo.path);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, anexo.filename, (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error en el servidor al descargar el archivo.', error: err.message });
                }
            }
        });
    } else {
        return res.status(404).json({ message: 'Archivo de anexo no encontrado en el servidor' });
    }

  } catch (error) {
    console.error('Error al obtener el anexo:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al obtener el anexo.', error: error.message });
    }
  }
};

const createConciliacion = async (req, res) => {
  try {
    if (!req.body.solicitudData) {
      return res.status(400).json({
        message: 'Missing solicitudData in request body.',
      });
    }

    const parsedData = JSON.parse(req.body.solicitudData);
    
    // Handle firma file by converting to base64 and storing in the document
    if (req.files && req.files.firma && req.files.firma[0]) {
      const signatureFile = req.files.firma[0];
      const fileContent = fs.readFileSync(signatureFile.path);
      parsedData.firma = {
        source: 'upload',
        name: signatureFile.originalname,
        dataUrl: `data:${signatureFile.mimetype};base64,${fileContent.toString('base64')}`,
      };
      fs.unlinkSync(signatureFile.path); // Clean up temp file
    }
    
    const dataToSave = parsedData;
    dataToSave.user = req.user._id;

    // Handle 'anexos' files by converting to base64 and storing in the document
    if (req.files && req.files.anexos) {
      const anexoInfoFromClient = parsedData.anexos || [];
      dataToSave.anexos = req.files.anexos.map(file => {
        const matchingInfo = anexoInfoFromClient.find(info => info.name === file.originalname);
        const fileContent = fs.readFileSync(file.path);
        const dataUrl = `data:${file.mimetype};base64,${fileContent.toString('base64')}`;
        fs.unlinkSync(file.path); // Clean up temp file

        return {
          filename: file.originalname, // Use originalname for consistency
          mimetype: file.mimetype,
          size: file.size,
          descripcion: matchingInfo ? matchingInfo.descripcion : '',
          dataUrl: dataUrl,
        };
      });
    } else {
      dataToSave.anexos = [];
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

const getConciliacionAnexo = async (req, res) => {
  try {
    const solicitud = await Conciliacion.findById(req.params.id).populate('user');

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud de conciliación no encontrada' });
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
    console.error('Error al obtener el anexo de conciliación:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al obtener el anexo.', error: error.message });
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
      conciliacion.firma = {
        source: 'upload',
        name: signatureFile.originalname,
        dataUrl: `data:${signatureFile.mimetype};base64,${fileContent.toString('base64')}`,
      };
      fs.unlinkSync(signatureFile.path);
    } else if (parsedData.firma) {
      conciliacion.firma = parsedData.firma;
    }
    conciliacion.markModified('firma');


    // Assign all other top-level fields from parsed data
    const fieldsToUpdate = ['sede', 'infoGeneral', 'convocantes', 'convocados', 'hechos', 'pretensiones'];
    fieldsToUpdate.forEach(field => {
        if(parsedData[field]) {
            conciliacion[field] = parsedData[field];
            conciliacion.markModified(field);
        }
    });

    // --- Robust Anexos Sync Logic (Store in DB) ---
    const newAnexosFromFiles = (req.files && req.files.anexos) || [];
    const anexoDataFromClient = parsedData.anexos || [];
    const clientAnexoFilenames = anexoDataFromClient.map(a => a.name);

    // 1. Filter out deleted annexes
    conciliacion.anexos = conciliacion.anexos.filter(existingAnexo => 
        clientAnexoFilenames.includes(existingAnexo.filename)
    );

    // 2. Update descriptions of existing annexes
    conciliacion.anexos.forEach(existingAnexo => {
        const anexoFromClient = anexoDataFromClient.find(a => a.name === existingAnexo.filename);
        if (anexoFromClient) {
            existingAnexo.descripcion = anexoFromClient.descripcion;
        }
    });

    // 3. Add new annexes (as base64)
    newAnexosFromFiles.forEach(newFile => {
        const anexoFromClient = anexoDataFromClient.find(a => a.name === newFile.originalname);
        if (anexoFromClient) {
            const fileContent = fs.readFileSync(newFile.path);
            const dataUrl = `data:${newFile.mimetype};base64,${fileContent.toString('base64')}`;
            fs.unlinkSync(newFile.path); // Clean up temp file

            conciliacion.anexos.push({
                filename: newFile.originalname,
                mimetype: newFile.mimetype,
                size: newFile.size,
                descripcion: anexoFromClient.descripcion,
                dataUrl: dataUrl,
            });
        }
    });

    // 4. Mark the array as modified for Mongoose
    conciliacion.markModified('anexos');
    
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

module.exports = { createConciliacion, getConciliacionDocumento, getConciliacionAnexo, getConciliacionById, updateConciliacion, getAnexo };
