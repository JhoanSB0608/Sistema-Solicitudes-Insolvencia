const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const htmlToPdfmake = require('html-to-pdfmake');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');

// -------------------- Fuentes --------------------
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

// -------------------- Helpers --------------------
const formatDate = d => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return String(d); }
};

const safe = (v, fallback = '') => (v === undefined || v === null || v === '') ? fallback : v;

const formatCurrency = num => {
  if (num == null || Number.isNaN(Number(num))) return '$0';
  return `$${Number(num).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// -------------------- Doc Definition Builder --------------------
function buildConciliacionDocDefinition(solicitud = {}) {
    const { 
        infoGeneral = {}, 
        convocantes = [], 
        convocados = [], 
        hechos = [], 
        pretensiones = [], 
        firma = {}, 
        sede = {}, 
        user = {},
        createdAt 
    } = solicitud;

    const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [60, 80, 60, 60],
        defaultStyle: { 
            font: 'Roboto', 
            fontSize: 11, 
            lineHeight: 1.3 
        },
        content: [],
        styles: {
            header: { 
                fontSize: 11, 
                bold: true, 
                alignment: 'left',
                margin: [0, 0, 0, 10] 
            },
            body: { 
                fontSize: 11, 
                alignment: 'justify',
                margin: [0, 5, 0, 5]
            },
            section: {
                fontSize: 11,
                alignment: 'justify',
                margin: [0, 8, 0, 8]
            }
        }
    };

    const c = docDefinition.content;

    // --- ENCABEZADO ---
    c.push({
        text: 'Señores',
        style: 'header'
    });

    c.push({
        text: safe(sede.entidadPromotora).toUpperCase(),
        style: 'header'
    });

    c.push({
        text: 'E. S. D.',
        style: 'header',
        margin: [0, 0, 0, 15]
    });

    // --- REFERENCIA ---
    c.push({
        text: [
            { text: 'REF. ', bold: true },
            'SOLICITUD CONCILIACIÓN EXTRAJUDICIAL EN DERECHO'
        ],
        style: 'body',
        margin: [0, 0, 0, 15]
    });

    // --- IDENTIFICACIÓN DEL CONVOCANTE ---
    const convocante = convocantes[0] || {};
    const nombreConvocante = convocante.tipoInvolucrado === 'Persona Jurídica'
        ? safe(convocante.razonSocial)
        : `${safe(convocante.primerNombre)} ${safe(convocante.segundoNombre)} ${safe(convocante.primerApellido)} ${safe(convocante.segundoApellido)}`.trim().toUpperCase();
    
    const idConvocante = `${safe(convocante.tipoIdentificacion)} No. ${safe(convocante.numeroIdentificacion)} de ${safe(convocante.ciudadExpedicion)}`;

    c.push({
        text: [
            { text: nombreConvocante, bold: true },
            `, identificada con ${idConvocante}; mayor de edad y domiciliado en la ciudad de ${safe(convocante.ciudad)}, solicitamos respetuosamente a usted se sirva de celebrar `
        ],
        style: 'body'
    });

    // --- TIPO DE AUDIENCIA ---
    c.push({
        text: [
            { text: 'AUDIENCIA DE CONCILIACIÓN EXTRAJUDICIAL EN DERECHO – ', bold: true },
            { text: safe(infoGeneral.tema).toUpperCase(), bold: true },
            { text: ' - ', bold: true }
        ],
        style: 'body'
    });

    // --- IDENTIFICACIÓN DEL CONVOCADO ---
    const convocado = convocados[0] || {};
    const nombreConvocado = convocado.tipoInvolucrado === 'Persona Jurídica'
        ? safe(convocado.razonSocial)
        : `${safe(convocado.primerNombre)} ${safe(convocado.segundoNombre)} ${safe(convocado.primerApellido)} ${safe(convocado.segundoApellido)}`.trim().toUpperCase();
    
    const idConvocado = `${safe(convocado.tipoIdentificacion)} No. ${safe(convocado.numeroIdentificacion)} de ${safe(convocado.ciudadExpedicion)}`;

    c.push({
        text: [
            'en contra de ',
            { text: nombreConvocado, bold: true },
            ` identificado con ${idConvocado}; de acuerdo con lo siguiente:`
        ],
        style: 'body',
        margin: [0, 0, 0, 15]
    });

    // --- HECHOS ---
    c.push({
        text: 'HECHOS',
        bold: true,
        alignment: 'center',
        margin: [0, 15, 0, 10]
    });

    hechos.forEach((h, idx) => {
        const numero = idx === 0 ? 'PRIMERO' : 
                      idx === 1 ? 'SEGUNDO' : 
                      idx === 2 ? 'TERCERO' : 
                      idx === 3 ? 'CUARTO' : 
                      idx === 4 ? 'QUINTO' : 
                      `${idx + 1}`;
        
        // Limpiar HTML y mantener formato básico
        let descripcion = h.descripcion || '';
        try {
            const parsed = htmlToPdfmake(descripcion, { window });
            c.push({
                text: [
                    { text: `${numero} – `, bold: true },
                    ...parsed
                ],
                style: 'section'
            });
        } catch (e) {
            // Fallback: remover tags HTML
            descripcion = descripcion.replace(/<[^>]+>/g, '');
            c.push({
                text: [
                    { text: `${numero} – `, bold: true },
                    descripcion
                ],
                style: 'section'
            });
        }
    });

    // --- PETICIONES ---
    c.push({
        text: 'PETICIONES',
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 10]
    });

    pretensiones.forEach((p, idx) => {
        const numero = idx === 0 ? 'PRIMERA' : 
                      idx === 1 ? 'SEGUNDA' : 
                      idx === 2 ? 'TERCERA' : 
                      idx === 3 ? 'CUARTA' : 
                      `${idx + 1}`;
        
        let descripcion = p.descripcion || '';
        try {
            const parsed = htmlToPdfmake(descripcion, { window });
            c.push({
                text: [
                    { text: `${numero}: `, bold: true },
                    ...parsed
                ],
                style: 'section'
            });
        } catch (e) {
            descripcion = descripcion.replace(/<[^>]+>/g, '');
            c.push({
                text: [
                    { text: `${numero}: `, bold: true },
                    descripcion
                ],
                style: 'section'
            });
        }
    });

    // --- FUNDAMENTOS DE DERECHO ---
    c.push({
        text: 'FUNDAMENTOS DE DERECHO',
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 10]
    });

    c.push({
        text: 'El artículo 44 de la Constitución Política de Colombia; Títulos XII y XXI del Código Civil; Ley 27 de 1977; Ley 1098 del 2006; artículo 133 a 159 del decreto 2737 de 1989; Ley 75 del 1968; artículo 390 y siguientes del Código General del Proceso y demás normas concordantes.',
        style: 'section'
    });

    // --- ANEXOS ---
    c.push({
        text: 'ANEXOS',
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 10]
    });

    c.push({
        text: 'Anexo los siguientes documentos',
        style: 'body',
        margin: [0, 0, 0, 5]
    });

    // Lista de anexos estándar basada en el PDF ejemplo
    const anexosEstandar = [
        `Copia de cédula de ciudadanía de ${nombreConvocante}`,
        `Copia de cédula de ciudadanía de ${nombreConvocado}`,
        `Registro civil de ${nombreConvocado}`,
        'Certificado de Cuenta Bancaria',
        'Poder otorgado'
    ];

    c.push({
        ol: anexosEstandar,
        margin: [40, 0, 0, 0]
    });

    // --- NOTIFICACIONES ---
    c.push({
        text: 'NOTIFICACIONES',
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 10]
    });

    c.push({
        text: [
            { text: 'La Accionante:\n', bold: true },
            `Email: ${safe(convocante.email)}\n\n`,
            { text: 'El accionado:\n', bold: true },
            `Email: ${safe(convocado.email)}`
        ],
        style: 'body',
        margin: [0, 0, 0, 30]
    });

    // --- FIRMA ---
    c.push({
        text: 'Atentamente;',
        alignment: 'left',
        margin: [0, 10, 0, 30]
    });

    // Firma si existe
    if (firma && firma.data) {
        c.push({ 
            image: firma.data, 
            width: 200, 
            alignment: 'left',
            margin: [0, 0, 0, 10]
        });
    }

    c.push({
        text: [
            { text: nombreConvocante + '\n', bold: true },
            `Cédula de Ciudadanía No. ${safe(convocante.numeroIdentificacion)} de ${safe(convocante.ciudadExpedicion)}.`
        ],
        alignment: 'left'
    });

    return docDefinition;
}

// -------------------- Generador Principal -------------------- 
async function generateConciliacionPdf(solicitud = {}) {
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = buildConciliacionDocDefinition(solicitud);
      const printer = new PdfPrinter(FONTS);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (error) {
      console.error('Error al generar el PDF de conciliación:', error);
      reject(error);
    }
  });
}

module.exports = { generateConciliacionPdf };