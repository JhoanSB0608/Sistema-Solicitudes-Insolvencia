const PdfPrinter = require('pdfmake');
const path = require('path');
const fs = require('fs');

const fontsDir = path.resolve(__dirname, '..', 'fonts');
const tryFile = name => fs.existsSync(path.join(fontsDir, name)) ? path.join(fontsDir, name) : null;

const FONTS = {
  Roboto: {
    normal: tryFile('Roboto-Regular.ttf') || '',
    bold: tryFile('Roboto-Bold.ttf') || '',
    italics: tryFile('Roboto-Italic.ttf') || '',
    bolditalics: tryFile('Roboto-BoldItalic.ttf') || ''
  }
};

async function generateConciliacionPdf(solicitud = {}) {
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = {
        content: [
          { text: 'Solicitud de Conciliación', style: 'header' },
          { text: `Este es un documento para la solicitud de tipo: ${solicitud.tipoSolicitud}` },
          { text: `Generado por: ${solicitud.user.name}`, margin: [0, 20, 0, 0] },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          }
        }
      };
      
      const printer = new PdfPrinter(FONTS);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateConciliacionPdf };
