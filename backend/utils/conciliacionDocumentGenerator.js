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

const safe = (v, fallback = 'No reporta') => (v === undefined || v === null || v === '') ? fallback : v;

const standardTableLayout = {
    hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#999', vLineColor: () => '#999',
    paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4,
};


// -------------------- Doc Definition Builder --------------------
function buildConciliacionDocDefinition(solicitud = {}) {
    const { infoGeneral = {}, convocantes = [], convocados = [], hechos = [], pretensiones = [], firma = {}, sede = {}, user = {} } = solicitud;

    const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 60, 40, 60],
        defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.15 },
        header: { text: 'Solicitud de Conciliación', alignment: 'center', margin: [0, 30, 0, 0] },
        footer: (currentPage, pageCount) => ({
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'right',
            margin: [0, 0, 40, 0],
            fontSize: 9
        }),
        content: [],
        styles: {
            header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
            subheader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
            fieldLabel: { bold: true, color: '#333' }
        }
    };

    const c = docDefinition.content;

    // --- Main Header ---
    c.push({ text: 'SOLICITUD DE CONCILIACIÓN EXTRAJUDICIAL EN DERECHO', style: 'header' });

    // --- Sede Info ---
    c.push({
        text: [
            { text: 'Ciudad: ', style: 'fieldLabel' }, `${safe(sede.ciudad)}, ${formatDate(solicitud.createdAt)}
`,
            { text: 'Entidad: ', style: 'fieldLabel' }, `${safe(sede.entidadPromotora)}
`,
            { text: 'Sede/Centro: ', style: 'fieldLabel' }, `${safe(sede.sedeCentro)}

`
        ]
    });

    // --- 1. DATOS GENERALES ---
    c.push({ text: '1. DATOS GENERALES', style: 'subheader' });
    c.push({
        ul: [
            `Solicitante del servicio: ${safe(infoGeneral.solicitanteServicio)}`,
            `Finalidad: ${safe(infoGeneral.finalidadServicio)}`,
            `Tiempo del conflicto: ${safe(infoGeneral.tiempoConflicto)}`,
            `Área del Derecho: ${safe(infoGeneral.areaDerecho)} - Tema: ${safe(infoGeneral.tema)}`,
            `Cuantía: ${infoGeneral.cuantiaIndeterminada ? 'Indeterminada' : formatCurrency(infoGeneral.cuantiaTotal)}`
        ]
    });

    // --- 2. PARTES ---
    c.push({ text: '2. PARTES EN EL CONFLICTO', style: 'subheader' });

    const buildPartyTable = (party, title) => {
        const fullName = party.tipoInvolucrado === 'Persona Jurídica'
            ? safe(party.razonSocial)
            : `${safe(party.primerNombre)} ${safe(party.segundoNombre)} ${safe(party.primerApellido)} ${safe(party.segundoApellido)}`.trim();
        
        return {
            table: {
                widths: ['*', '*'],
                body: [
                    [{ text: title, style: 'fieldLabel', colSpan: 2, alignment: 'center', fillColor: '#eaeaea' }, {}],
                    [{ text: 'Nombre / Razón Social', style: 'fieldLabel' }, fullName],
                    [{ text: 'Identificación', style: 'fieldLabel' }, `${safe(party.tipoIdentificacion)} - ${safe(party.numeroIdentificacion)}`],
                    [{ text: 'Teléfono', style: 'fieldLabel' }, safe(party.telefono)],
                    [{ text: 'Email', style: 'fieldLabel' }, safe(party.email)],
                    [{ text: 'Dirección', style: 'fieldLabel' }, `${safe(party.domicilio)}, ${safe(party.ciudad)} - ${safe(party.departamento)}`]
                ]
            },
            layout: standardTableLayout,
            margin: [0, 0, 0, 10]
        };
    };

    c.push({ text: 'CONVOCANTE(S)', bold: true, margin: [0, 5, 0, 5] });
    convocantes.forEach(p => c.push(buildPartyTable(p, 'Datos del Convocante')));

    c.push({ text: 'CONVOCADO(S)', bold: true, margin: [0, 10, 0, 5] });
    convocados.forEach(p => c.push(buildPartyTable(p, 'Datos del Convocado')));

    // --- 3. HECHOS ---
    c.push({ text: '3. HECHOS', style: 'subheader' });
    hechos.forEach((h, idx) => {
        const html = `<b>${idx + 1}.</b> ${h.descripcion}`;
        try {
            c.push(htmlToPdfmake(html, { window }));
        } catch (e) {
            console.error("HTML to PDFmake conversion error:", e);
            c.push(`${idx + 1}. ${h.descripcion.replace(/<[^>]+>/g, '')}`); // Fallback
        }
    });

    // --- 4. PRETENSIONES ---
    c.push({ text: '4. PRETENSIONES', style: 'subheader' });
    pretensiones.forEach((p, idx) => {
        const html = `<b>${idx + 1}.</b> ${p.descripcion}`;
        try {
            c.push(htmlToPdfmake(html, { window }));
        } catch (e) {
            console.error("HTML to PDFmake conversion error:", e);
            c.push(`${idx + 1}. ${p.descripcion.replace(/<[^>]+>/g, '')}`); // Fallback
        }
    });

    // --- 5. ANEXOS ---
    c.push({ text: '5. ANEXOS', style: 'subheader' });
    if (solicitud.anexos && solicitud.anexos.length > 0) {
        c.push({
            ul: solicitud.anexos.map(anexo => safe(anexo.filename))
        });
    } else {
        c.push('No se adjuntaron anexos.');
    }

    // --- FIRMA ---
    c.push({ text: 'Firma del solicitante', style: 'subheader', margin: [0, 40, 0, 10] });

    if (firma && firma.data) {
        c.push({ image: firma.data, width: 150, alignment: 'left' });
    }

    c.push({
        text: `\n\n__________________________________\n${safe(user.name)}\nC.C.`,
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

// Helper to format currency, could be moved to a shared utils file
const formatCurrency = num => {
  if (num == null || Number.isNaN(Number(num))) return '$0';
  return `$${Number(num).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

module.exports = { generateConciliacionPdf };