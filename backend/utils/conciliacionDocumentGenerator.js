
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Utility: Convert HTML <p> blocks to plain text lines
function htmlToPlainText(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || '';
}

// Draw multiline text with automatic line wrapping
function drawMultilineText(page, text, x, y, size, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let offsetY = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = page.getFont().widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && i > 0) {
      page.drawText(line.trim(), { x, y: y - offsetY, size });
      line = words[i] + ' ';
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) page.drawText(line.trim(), { x, y: y - offsetY, size });
  return offsetY;
}

// Main generator
async function generatePDF(data, outputPath) {
  const pdfDoc = await PDFDocument.create();
  // Crear página A4 con márgenes idénticos al PDF original
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const marginLeft = 55; // margen idéntico
  const marginRight = 540;
  const marginTop = 785;
  let y = marginTop;([595.28, 841.89]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.setFont(font);

  let y = 800;
  const margin = 50;
  const maxWidth = 495;
  const lineHeight = 16;
  const smallSize = 11;
  const titleSize = 16;

  // --- HEADER (Based on provided PDF) ---
  page.drawText('SOLICITUD DE CONCILIACIÓN EXTRAJUDICIAL EN DERECHO', {
    x: margin,
    y,
    size: titleSize,
    font,
  });

  y -= 30;

  // Tipo de Solicitud
  page.drawText(`Tipo de Solicitud: ${data.tipoSolicitud || ''}`, {
    x: margin,
    y,
    size: smallSize,
  });
  y -= 20;

  // Sede
  page.drawText(`Sede: ${data.sede?.departamento} - ${data.sede?.ciudad} / ${data.sede?.entidadPromotora}`, {
    x: margin,
    y,
    size: smallSize,
  });

  y -= 40;
  page.drawText('1. DATOS GENERALES', { x: margin, y, size: smallSize + 1 });
  y -= 20;

  page.drawText(`Solicitante Servicio: ${data.infoGeneral?.solicitanteServicio}`, {
    x: margin,
    y,
    size: smallSize,
  });
  y -= 16;
  page.drawText(`Finalidad: ${data.infoGeneral?.finalidadServicio}`, { x: margin, y, size: smallSize });
  y -= 16;
  page.drawText(`Tiempo del conflicto: ${data.infoGeneral?.tiempoConflicto}`, { x: margin, y, size: smallSize });

  y -= 30;
  page.drawText('2. CONVOCANTES', { x: margin, y, size: smallSize + 1 });
  y -= 20;

  data.convocantes.forEach((p) => {
    page.drawText(`${p.primerNombre} ${p.segundoNombre} ${p.primerApellido} ${p.segundoApellido}`.trim(), {
      x: margin,
      y,
      size: smallSize,
    });
    y -= lineHeight;
    page.drawText(`Identificación: ${p.tipoIdentificacion} - ${p.numeroIdentificacion}`, {
      x: margin,
      y,
      size: smallSize,
    });
    y -= 30;
  });

  page.drawText('3. CONVOCADOS', { x: margin, y, size: smallSize + 1 });
  y -= 20;

  data.convocados.forEach((p) => {
    page.drawText(`${p.primerNombre} ${p.segundoNombre} ${p.primerApellido} ${p.segundoApellido}`.trim(), {
      x: margin,
      y,
      size: smallSize,
    });
    y -= lineHeight;
    page.drawText(`Identificación: ${p.tipoIdentificacion} - ${p.numeroIdentificacion}`, {
      x: margin,
      y,
      size: smallSize,
    });
    y -= 30;
  });

  // --- HECHOS ---
  page.drawText('4. HECHOS', { x: margin, y, size: smallSize + 1 });
  y -= 20;

  data.hechos.forEach((h, idx) => {
    const text = `${idx + 1}. ${htmlToPlainText(h.descripcion)}`;
    const offset = drawMultilineText(page, text, margin, y, smallSize, maxWidth, lineHeight);
    y -= offset + 20;
  });

  // --- PRETENSIONES ---
  page.drawText('5. PRETENSIONES', { x: margin, y, size: smallSize + 1 });
  y -= 20;

  data.pretensiones.forEach((p, idx) => {
    const text = `${idx + 1}. ${htmlToPlainText(p.descripcion)}`;
    const offset = drawMultilineText(page, text, margin, y, smallSize, maxWidth, lineHeight);
    y -= offset + 20;
  });

  // --- FIRMA ---
  page.drawText('Firma del solicitante:', { x: margin, y, size: smallSize });
  y -= 10;

  if (data.firma?.data) {
    const base64Data = data.firma.data.split(',')[1];
    const img = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
    const pngDims = img.scale(0.35);
    page.drawImage(img, {
      x: margin,
      y: y - pngDims.height,
      width: pngDims.width,
      height: pngDims.height,
    });
    y -= pngDims.height + 20;
  }

  // SAVE FILE
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('PDF generado correctamente:', outputPath);
}

module.exports = { generatePDF };
