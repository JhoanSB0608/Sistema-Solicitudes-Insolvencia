// documentGenerator.js - RÉPLICA EXACTA del formato original
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');
const { Unidades } = require('./numeroALetras');
const { info } = require('console');

// -------------------- Fuentes --------------------
const fontsDir = path.resolve(__dirname, '..', 'fonts');
const tryFile = name => fs.existsSync(path.join(fontsDir, name)) ? path.join(fontsDir, name) : null;

const FONTS = {
  Calibri: {
    normal: tryFile('calibri-regular.ttf') || tryFile('Roboto-Regular.ttf') || '',
    bold: tryFile('calibri-bold.ttf') || tryFile('Roboto-Bold.ttf') || '',
    italics: tryFile('calibri-italic.ttf') || tryFile('Roboto-Italic.ttf') || '',
    bolditalics: tryFile('calibri-bold-italic.ttf') || tryFile('Roboto-BoldItalic.ttf') || ''
  }
};

// -------------------- Helpers --------------------
const formatCurrency = num => {
  if (num == null || Number.isNaN(Number(num))) return '$0,00';
  return `$${Number(num).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = d => {
  if (!d) return 'Se desconoce esta información';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return String(d); }
};

const safe = (v, fallback = 'No reporta') => (v === undefined || v === null || v === '') ? fallback : v;

// Layout estándar para tablas
const standardTableLayout = {
  hLineWidth: () => 1,
  vLineWidth: () => 1,
  hLineColor: () => '#000000',
  vLineColor: () => '#000000',
  paddingLeft: () => 2,
  paddingRight: () => 2,
  paddingTop: () => 1,
  paddingBottom: () => 1
};

// -------------------- Construcción docDefinition --------------------
function buildDocDefinition(solicitud = {}) {
  const deudor = solicitud.deudor || {};
  const sede = solicitud.sede || {};
  const acreencias = Array.isArray(solicitud.acreencias) ? solicitud.acreencias : [];
  const bienesMuebles = Array.isArray(solicitud.bienesMuebles) ? solicitud.bienesMuebles : [];
  const bienesInmuebles = Array.isArray(solicitud.bienesInmuebles) ? solicitud.bienesInmuebles : [];
  const infoFin = solicitud.informacionFinanciera || {};
  const procesosJudiciales = Array.isArray(infoFin.procesosJudiciales) ? infoFin.procesosJudiciales : [];
  const obligacionesAlimentarias = Array.isArray(infoFin.obligacionesAlimentarias) ? infoFin.obligacionesAlimentarias : [];
  const propuestaPago = solicitud.propuestaPago;

  const totalCapital = acreencias.reduce((s, a) => s + (Number(a.capital)), 0);
  const acreenciasEnMora = acreencias.filter(a => a.creditoEnMora).length;

  const capitalEnMora = acreencias.filter(a => a.creditoEnMora).reduce((s, a) => s + (Number(a.capital)), 0);

  const docDefinition = {
    pageSize: 'LEGAL',
    pageMargins: [40, 95, 40, 150],
    defaultStyle: {
      font: 'Calibri',
      fontSize: 9,
      lineHeight: 1.15
    },
    footer: function(currentPage, pageCount) {
      return {
        text: `página ${currentPage} de ${pageCount}`,
        alignment: 'right',
        margin: [0, 5, 40, 35],
        fontSize: 9
      };
    },
    content: []
  };

  const c = docDefinition.content;

  // ========== ENCABEZADO ==========
  c.push({
  columns: [
    {
      width: '*',
      stack: [
        { text: 'Señores', fontSize: 9, margin: [0, 0, 0, 1] },
        { text: safe(sede.entidadPromotora?.toUpperCase()), bold: true, fontSize: 9, margin: [0, 0, 0, 1] },
        { text: safe(sede.sedeCentro), fontSize: 9, margin: [0, 0, 0, 1] },
        { text: `${safe(sede.ciudad)} - ${safe(sede.departamento)}`, fontSize: 9, margin: [0, 0, 0, 8] }
      ]
    },
    {
      width: 100,
      stack: [
        { text: 'Recibido', fontSize: 8, bold: true, alignment: 'right', margin: [0, 0, 0, 1] },
        { text: `FECHA: ${moment().format('DD/MM/YYYY')}`, fontSize: 8, alignment: 'right', margin: [0, 0, 0, 0] }
      ]
    }
  ]
});

  // ========== REFERENCIA Y DEUDOR ==========
c.push({
  columns: [
    { text: 'REFERENCIA:', bold: true, fontSize: 9, width: 70 },
    { text: 'Solicitud de Insolvencia Económica de Persona Natural No Comerciante.', fontSize: 9 }
  ],
  columnGap: 6,
  margin: [0, 0, 0, 4]
});

c.push({
  columns: [
    { text: 'DEUDOR(A):', bold: true, fontSize: 9, width: 70 },
    { 
      text: `${(deudor.primerNombre || '')} ${(deudor.segundoNombre || '')} ${(deudor.primerApellido || '')} ${(deudor.segundoApellido || '')}`
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase() + (deudor.cedula ? ` - C.C. ${deudor.cedula}` : ''),
      fontSize: 9
    }
  ],
  columnGap: 6,
  margin: [0, 0, 0, 16]
});

  // ========== PRIMER PÁRRAFO ==========
  const nombreCompleto = `${(deudor.primerNombre || '')} ${(deudor.segundoNombre || '')} ${(deudor.primerApellido || '')} ${(deudor.segundoApellido || '')}`.replace(/\s+/g, ' ').trim();
  
  c.push({
    text: [
      { text: nombreCompleto, bold: true },
      ', mayor de edad, con domicilio en la ciudad de ',
      { text: safe(deudor.ciudad), bold: false }, ' - ', {text: safe(deudor.departamento)},
      ', identificado(a) con cédula de ciudadanía número ',
      { text: safe(deudor.cedula), bold: false },
      ', expedida en la ciudad de ', {text: safe(deudor.ciudadExpedicion)},' - ', {text: safe(deudor.departamentoExpedicion)}, ' actuando en mi propio nombre y en mi condición de ',
      { text: 'PERSONA NATURAL NO COMERCIANTE', bold: true },
      ', con fundamento en la Ley 1564 de 2012, modificada en su título IV por la ley 2445 de 2025, especialmente en el Artículo 531 y siguientes y en Decreto Reglamentario 1069 de 2015, mediante el presente escrito solicito que se inicie y tramite el correspondiente proceso de negociación de deudas con los acreedores declarados en la presente solicitud, de quienes se suministrará información completa en el capitulo correspondiente.'
    ],
    fontSize: 9,
    alignment: 'justify',
    margin: [0, 0, 0, 16]
  });

  // ========== SEGUNDO PÁRRAFO ==========
  c.push({
    text: `En adición a lo antes expuesto, declaro que soy una persona natural no comerciante, identifico y relaciono a ${acreencias.length} (${Unidades(acreencias.length)}) acreencias, de las cuales con ${acreenciasEnMora} (${Unidades(acreenciasEnMora)}) acreencias me encuentro en mora por más de noventa (90) días y el valor porcentual de mis obligaciones incumplidas representan no menos de treinta por ciento (30%) del pasivo total a mi cargo, cumpliendo de esta forma con los supuestos de insolvencia establecidos en el Artículo 538 del Código General del Proceso, modificado por el articulo Noveno (9) de la ley 2445 de 2025, razón por la cual, es procedente este trámite.`,
    fontSize: 9,
    alignment: 'justify',
    margin: [0, 0, 0, 16]
  });

  // ========== TERCER PÁRRAFO ==========
  c.push({
    text: 'De manera expresa, declaro en mi calidad de deudor(a), bajo la gravedad del juramento, que toda la información que se suministra y adjunta en esta solicitud es verdadera, no se ha incurrido en omisiones, imprecisiones o errores que impidan conocer mi verdadera situación económica y capacidad de pago.',
    fontSize: 9,
    alignment: 'justify',
    margin: [0, 0, 0, 16]
  });

  // ========== CUARTO PÁRRAFO ==========
  c.push({
    text: 'De conformidad al Artículo 539 de la Ley 1564 de 2012, la presente solicitud se fundamenta: La solicitud de trámite de negociación de deudas deberá ser presentada directamente por el deudor, quien podrá comparecer al trámite acompañado o representado por apoderado judicial. Será obligatoria su asistencia con o a través de apoderado judicial en los casos en que sea superada la minima cuantía. La solicitud deberá contener:',
    fontSize: 9,
    alignment: 'justify',
    margin: [0, 0, 0, 20]
  });

  // ========== 1. CAUSAS DE INSOLVENCIA ==========
  c.push({ text: '1. LAS SIGUIENTES SON LAS CAUSAS QUE CONLLEVARON A LA SITUACIÓN DE INSOLVENCIA ECONÓMICA:', fontSize: 9, bold: true, margin: [0, 0, 0, 12] });
  
  const causasTexto = solicitud.causasInsolvencia || 
    `TOME LA DECISIÓN DE ADQUIRIR LOS DISTINTOS CRÉDITOS CON EL OBJETIVO DE MEJORAR MI CALIDAD DE VIDA Y LA MI FAMILIA, ADEMÁS DE QUERER GENERAR INGRESOS EXTRAS POR ELLO DECIDÍ INVERTIR EN UNA MONEDA DIGITAL QUE OFRECÍA GRAN RENTABILIDAD DE GANANCIAS, SIN EMBARGO, CON EL TIEMPO DESAFORTUNADAMENTE LA PLATAFORMA DE DICHA MONEDA DESAPARECIÓ SIN GENERAR ALGÚN TIPO DE GANANCIA, POR LO QUE EL DINERO ALLÍ INVERTIDO SE PERDIÓ Y ACTUALMENTE NO CUENTO CON LA CAPACIDAD DE PAGO PARA CUMPLIR EN DEBIDA FORMA CON MIS OBLIGACIONES CREDITICIAS, YA QUE LO DEVENGADO SOLO ES SUFICIENTE PARA MIS GASTOS PERSONALES Y FAMILIARES, POR ELLO, ME ENCUENTRO EN MORA EN LA MAYORÍA DE ELLAS E INICIO EL PRESENTE PROCESO`;
  
  c.push({
    text: causasTexto.toUpperCase(),
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 16]
  });

  // ========== 2. RESUMEN DE ACREENCIAS ==========
  c.push({ text: '2. RESUMEN DE LAS ACREENCIAS:', fontSize: 9, bold: true, margin: [0, 0, 0, 12] });

  const resumenRows = [
    [
      { text: 'ACREEDORES', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'CAPITAL', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'QUÓRUM', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'INTERÉS\nCORRIENTE', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'INTERÉS DE\nMORA', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'OTROS\nCONCEPTOS\nCAUSADOS', bold: true, fontSize: 9, alignment: 'center' },
      { text: 'DÍAS EN\nMORA', bold: true, fontSize: 9, alignment: 'center' }
    ]
  ];

  const getClassFromNaturaleza = (naturaleza) => {
    if (!naturaleza) return 'QUINTA CLASE';
    if (naturaleza.toUpperCase().includes('PRIMERA CLASE')) return 'PRIMERA CLASE';
    if (naturaleza.toUpperCase().includes('SEGUNDA CLASE')) return 'SEGUNDA CLASE';
    if (naturaleza.toUpperCase().includes('TERCERA CLASE')) return 'TERCERA CLASE';
    if (naturaleza.toUpperCase().includes('CUARTA CLASE')) return 'CUARTA CLASE';
    return 'QUINTA CLASE';
  };

  const groupedAcreencias = acreencias.reduce((acc, a) => {
    const aClass = getClassFromNaturaleza(a.naturalezaCredito);
    if (!acc[aClass]) {
      acc[aClass] = [];
    }
    acc[aClass].push(a);
    return acc;
  }, {});

  const classOrder = ['PRIMERA CLASE', 'SEGUNDA CLASE', 'TERCERA CLASE', 'CUARTA CLASE', 'QUINTA CLASE'];

  let grandTotalCapital = 0;
  let grandTotalInteresCorriente = 0;
  let grandTotalInteresMoratorio = 0;

  classOrder.forEach(className => {
    if (groupedAcreencias[className]) {
      resumenRows.push([
        { text: className, bold: true, fontSize: 9, colSpan: 7, alignment: 'center' },
        {}, {}, {}, {}, {}, {}
      ]);

      let classTotalCapital = 0;
      let classTotalInteresCorriente = 0;
      let classTotalInteresMoratorio = 0;

      groupedAcreencias[className].forEach(a => {
        const nombre = (a.acreedor && (typeof a.acreedor === 'object' ? (a.acreedor.nombre || '') : a.acreedor)) || 'No reporta';
        const capital = Number(a.capital) || 0;
        const interesCorriente = Number(a.valorTotalInteresCorriente) || 0;
        const interesMoratorio = Number(a.valorTotalInteresMoratorio) || 0;

        classTotalCapital += capital;
        classTotalInteresCorriente += interesCorriente;
        classTotalInteresMoratorio += interesMoratorio;

        const porcentaje = totalCapital > 0 ? `${(Math.floor((capital / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
        const diasMora = a.creditoEnMora ? 'Más de 90\ndías.' : '';

        resumenRows.push([
          { text: nombre, fontSize: 9 },
          { text: formatCurrency(capital), fontSize: 9, alignment: 'right' },
          { text: porcentaje, fontSize: 9, alignment: 'center' },
          { text: formatCurrency(interesCorriente), fontSize: 9, alignment: 'right' },
          { text: formatCurrency(interesMoratorio), fontSize: 9, alignment: 'right' },
          { text: 'No Reporta', fontSize: 9, alignment: 'center' },
          { text: diasMora, fontSize: 9, alignment: 'center' }
        ]);
      });

      grandTotalCapital += classTotalCapital;
      grandTotalInteresCorriente += classTotalInteresCorriente;
      grandTotalInteresMoratorio += classTotalInteresMoratorio;

      // Total for the class
      const classPorcentaje = totalCapital > 0 ? `${(Math.floor((classTotalCapital / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
      resumenRows.push([
        { text: `TOTAL ACREENCIAS ${className}`, bold: true, fontSize: 9 },
        { text: formatCurrency(classTotalCapital), bold: true, fontSize: 9, alignment: 'right' },
        { text: classPorcentaje, bold: true, fontSize: 9, alignment: 'center' },
        { text: formatCurrency(classTotalInteresCorriente), bold: true, fontSize: 9, alignment: 'right' },
        { text: formatCurrency(classTotalInteresMoratorio), bold: true, fontSize: 9, alignment: 'right' },
        { text: '$0,00', bold: true, fontSize: 9, alignment: 'center' },
        { text: '' }
      ]);
    }
  });

  // Total general
  resumenRows.push([
    { text: 'TOTAL ACREENCIAS', bold: true, fontSize: 9 },
    { text: formatCurrency(grandTotalCapital), bold: true, fontSize: 9, alignment: 'right' },
    { text: '100.00%', bold: true, fontSize: 9, alignment: 'center' },
    { text: formatCurrency(grandTotalInteresCorriente), bold: true, fontSize: 9, alignment: 'right' },
    { text: formatCurrency(grandTotalInteresMoratorio), bold: true, fontSize: 9, alignment: 'right' },
    { text: '$0,00', bold: true, fontSize: 9, alignment: 'center' },
    { text: '' }
  ]);

  // Total en mora
  const moraPorcentaje = totalCapital > 0 ? `${(Math.floor((capitalEnMora / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
  resumenRows.push([
    { text: 'TOTAL DEL CAPITAL EN MORA POR MÁS DE 90 DÍAS\n(No aplica a créditos cuyo pago se esté realizando mediante libranza o descuento por nómina)', fontSize: 9, bold: true },
    { text: formatCurrency(capitalEnMora), bold: true, fontSize: 9, alignment: 'right' },
    { text: moraPorcentaje, bold: true, fontSize: 9, alignment: 'center' },
    { text: '', colSpan: 4 },
    {}, {}, {}
  ]);

  c.push({
    table: {
      widths: ['*', 65, 55, 55, 55, 55, 55],
      body: resumenRows
    },
    layout: standardTableLayout,
    margin: [15, 0, 0, 15]
  });

  // ========== 3. DETALLE DE ACREENCIAS (Nueva página) ==========
  c.push({ 
    text: '3. DETALLE DE LAS ACREENCIAS:', 
    fontSize: 9,
    bold: true,
    margin: [0, 0, 0, 6],
    pageBreak: 'before'
  });
  
  c.push({ 
    text: 'Se presenta una relación completa y actualizada de todos los acreedores, en el orden de prelación de créditos que señalan los Artículos 2488 y siguientes del Código Civil y con corte al último día calendario del mes inmediatamente anterior a aquel en que se presenta la solicitud:', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 12]
  });

  // Para cada acreencia, crear una tabla compacta
  acreencias.forEach((a, idx) => {
    const nombreAcreedor = (a.acreedor && (typeof a.acreedor === 'object' ? (a.acreedor.nombre || '') : a.acreedor)) || 'No reporta';

    const body = [];

    
    // ✅ Primera fila: título centrado con colSpan
    body.push([
      { 
        text: `Acreencia No. ${idx + 1}`, 
        bold: true, 
        fontSize: 9, 
        alignment: 'center', 
        margin: [0, 4, 0, 4],
        colSpan: 2 
      }, 
      {}
    ]);

    // Tabla de detalle de acreencia - formato compacto del original
    const detalleRows = [
      ['Nombre', nombreAcreedor],
      ['Tipo de Documento', a.tipoDoc],
      ['No. de Documento', safe((a.acreedor && (a.acreedor.nit || a.acreedor.nitCc || a.acreedor.documento)) || a.documento || '')],
      ['Dirección de notificación judicial', (a.acreedor && a.acreedor.direccion) || safe(a.direccion)],
      ['País', 'Colombia'],
      ['Departamento', (a.acreedor && a.acreedor.departamento) || safe(a.departamento,)],
      ['Ciudad', (a.acreedor && a.acreedor.ciudad) || safe(a.ciudad,)],
      ['Dirección de notificación electrónica', (a.acreedor && a.acreedor.email) || safe(a.email)],
      ['Teléfono', (a.acreedor && a.acreedor.telefono) || safe(a.telefono)],
      ['Tipo de Acreencia', safe(a.tipoAcreencia)],
      ['Naturaleza del crédito', safe(a.naturalezaCredito)],
      ['Crédito en condición de legalmente postergado (Artículo 572A,\nCausal 1)', a.creditoPostergado ? 'SI' : 'NO'],
      ['Descripción del crédito', safe(a.descripcionCredito)],
      ['Valor en capital', formatCurrency(a.capital)],
      ['Valor en interés corriente', a.valorTotalInteresCorriente > 0 ? formatCurrency(a.valorTotalInteresCorriente) : 'Se desconoce esta información'],
      ['Tasa de interés corriente', safe(a.tasaInteresCorriente)],
      ['Tipo de interés corriente', safe(a.tipoInteresCorriente)],
      ['Cuantía total de la obligación', formatCurrency((Number(a.capital||0) + Number(a.valorTotalInteresCorriente||0) + Number(a.valorTotalInteresMoratorio||0)))],
      ['¿El pago del crédito se está realizando mediante libranza o\ncualquier otro tipo de descuento por nómina?', a.pagoPorLibranza ? 'SI' : 'NO'],
      ['Número de días en mora', a.creditoEnMora ? 'Más de 90 días' : ''],
      ['Más de 90 días en mora', a.creditoEnMora ? 'SI' : 'No'],
      ['Valor en interes moratorio', a.valorTotalInteresMoratorio > 0 ? formatCurrency(a.valorTotalInteresMoratorio) : 'Se desconoce esta información'],
      ['Tasa de interés moratorio', safe(a.tasaInteresMoratorio)],
      ['Tipo de interés moratorio', safe(a.tipoInteresMoratorio)],
      ['Fecha de otorgamiento', formatDate(a.fechaOtorgamiento) === 'Se desconoce esta información' ? 'Se desconoce esta información.' : formatDate(a.fechaOtorgamiento) + '.'],
      ['Fecha de vencimiento', formatDate(a.fechaVencimiento) === 'Se desconoce esta información' ? 'Se desconoce esta información.' : formatDate(a.fechaVencimiento) + '.']
    ];

    detalleRows.forEach(row => {
      body.push([
        { text: row[0], fontSize: 9, margin: [4, 2, 2, 2] },
        { text: row[1], fontSize: 9, margin: [4, 2, 2, 2] }
      ]);
    });

    c.push({
      unbreakable: true, // Prevent this block from breaking across pages
      // Using columns to create a robust indented block
      columns: [
        { width: 15, text: '' }, // Spacer column for left indentation
        {
          width: '*',
          table: { 
            widths: ['auto', '*'], 
            body
          },
          layout: standardTableLayout,
        }
      ],
      columnGap: 0,
      // Apply vertical margin to the entire columns block
      margin: [15, 0, 0, 15]
    });
  });

  // ========== 4. BIENES ==========
  c.push({ 
    text: '4. RELACIÓN E INVENTARIO DE LOS BIENES MUEBLES E INMUEBLES:', 
    fontSize: 9,
    bold: true,
    margin: [0, 0, 0, 6],
  });
  
  c.push({ 
    text: 'Se presenta una relación completa y detallada de los bienes muebles e inmuebles:', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 6]
  });

  // 4.1 Bienes Muebles
  c.push({ 
    text: '4.1 Bienes Muebles', 
    fontSize: 9,
    bold: true,
    margin: [15, 6, 0, 6]
  });

  if (!bienesMuebles.length) {
  c.push({ 
    text: 'Se manifiesta bajo la gravedad de juramento que no se poseen Bienes Muebles.', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 6]
  });
} else {
  bienesMuebles.forEach((b, i) => {

    const body = [];

    // ✅ Primera fila: título centrado con colSpan
    body.push([
      { 
        text: `Bien Mueble No. ${i + 1}`, 
        bold: true, 
        fontSize: 9, 
        alignment: 'center', 
        margin: [0, 4, 0, 4],
        colSpan: 2 
      }, 
      {} // celda vacía obligatoria para completar el colSpan
    ]);

    // ✅ Filas de contenido
    const rows = [
      ['Descripción', safe(b.descripcion)],
      ['Clasificación', safe(b.clasificacion)],
      ['Marca', safe(b.marca)],
      ['Avalúo Comercial Estimado', formatCurrency(b.avaluoComercial)]
    ];

    rows.forEach(r => {
      body.push([
        { text: r[0], fontSize: 9, margin: [4, 2, 2, 2] },
        { text: r[1], fontSize: 9, margin: [4, 2, 2, 2] }
      ]);
    });

    // ✅ Tabla individual del bien
    c.push({
      unbreakable: true,
      columns: [
        { width: 15, text: '' },
        {
          width: '*',
          table: { 
            widths: ['auto', '*'],
            body
          },
          layout: standardTableLayout,
        }
      ],
      columnGap: 0,
      margin: [15, 0, 0, 8]
    });
  });

  // ✅ Total Avalúo Comercial Estimado
  const totalAvaluo = bienesMuebles.reduce((s, b) => s + (Number(b.avaluoComercial)), 0);

  c.push({
    unbreakable: true,
    columns: [
      { width: 15, text: '' },
      {
        width: '*',
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { 
                text: 'Total Avalúo Comercial Estimado de Bienes Muebles', 
                bold: true, 
                fontSize: 9, 
                alignment: 'center', 
                margin: [0, 3, 0, 3], 
                colSpan: 2 
              }, 
              {}
            ],
            [
              { text: 'Total', bold: true, fontSize: 9, margin: [4, 2, 2, 2] },
              { text: formatCurrency(totalAvaluo), bold: true, fontSize: 9, alignment: 'right', margin: [4, 2, 2, 2] }
            ]
          ]
        },
        layout: standardTableLayout,
      }
    ],
    columnGap: 0,
    margin: [15, 0, 0, 8]
  });

  c.push({ 
    text: 'Se manifiesta bajo gravedad de juramento y conforme al art. 594 de la ley 1564 de 2012, en su numeral 11, los bienes relacionados son inembargables', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 6]
  });
}

  // 4.2 Bienes Inmuebles
  c.push({ 
    text: '4.2 Bienes Inmuebles', 
    fontSize: 9,
    bold: true,
    margin: [15, 6, 0, 6]
  });

if (!bienesInmuebles.length) {
  c.push({ 
    text: 'Se manifiesta bajo la gravedad de juramento que no se poseen Bienes Inmuebles.', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });
} else {
  bienesInmuebles.forEach((b, i) => {

    const body = [];

    // ✅ Primera fila: título centrado con colSpan
    body.push([
      { 
        text: `Bien Inmueble No. ${i + 1}`, 
        bold: true, 
        fontSize: 9, 
        alignment: 'center', 
        margin: [0, 4, 0, 4],
        colSpan: 2 
      }, 
      {}
    ]);

    // ✅ Filas de contenido
    const rows = [
      ['Descripción', safe(b.descripcion)],
      ['Matrícula Inmobiliaria', safe(b.matricula)],
      ['Dirección', safe(b.direccion)],
      ['Ciudad', safe(b.ciudad)],
      ['Avalúo Comercial', formatCurrency(b.avaluoComercial)],
      ['Afectado a Vivienda Familiar', b.afectadoVivienda ? 'SI' : 'NO']
    ];

    rows.forEach(r => {
      body.push([
        { text: r[0], fontSize: 9, margin: [4, 2, 2, 2] },
        { text: r[1], fontSize: 9, margin: [4, 2, 2, 2] }
      ]);
    });

    // ✅ Tabla individual del inmueble
    c.push({
      table: { 
        widths: ['*', '*'],
        body
      },
      layout: standardTableLayout,
      margin: [15, 0, 0, 8]
    });
  });

  // ✅ Total Avalúo Comercial Estimado
  const totalAvaluoInmuebles = bienesInmuebles.reduce((s, b) => s + (Number(b.avaluoComercial)), 0);

  c.push({
    table: {
      widths: ['*', '*'],
      body: [
        [
          { 
            text: 'Total Avalúo Comercial Estimado de Bienes Inmuebles', 
            bold: true, 
            fontSize: 9, 
            alignment: 'center', 
            margin: [0, 3, 0, 3], 
            colSpan: 2 
          }, 
          {}
        ],
        [
          { text: 'Total', bold: true, fontSize: 9, margin: [4, 2, 2, 2] },
          { text: formatCurrency(totalAvaluoInmuebles), bold: true, fontSize: 9, alignment: 'right', margin: [4, 2, 2, 2] }
        ]
      ]
    },
    layout: standardTableLayout,
    margin: [15, 0, 0, 8]
  });
}

  // ========== 5. PROCESOS JUDICIALES ==========
  c.push({ 
    text: '5. PROCESOS JUDICIALES, ADMINISTRATIVOS O PRIVADOS', 
    fontSize: 9,
    bold: true,
    margin: [0, 6, 0, 6]
  });

if (!procesosJudiciales.length) {
  c.push({ 
    text: 'Se manifiesta bajo la gravedad de juramento que no se tienen procesos en contra.', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });
} else {
  procesosJudiciales.forEach((p, idx) => {
    const body = [];

    // ✅ Fila de título centrada con colSpan
    body.push([
      { 
        text: `Proceso Judicial No. ${safe(p.radicado)}`, 
        bold: true, 
        fontSize: 9, 
        alignment: 'center', 
        margin: [0, 4, 0, 4],
        colSpan: 2 
      }, 
      {}
    ]);

    // ✅ Filas de detalle
    const detalleRows = [
      ['Proceso Judicial', safe(p.tipoProceso), 'En Contra'],
      ['Tipo de Proceso', safe(p.tipoProceso)],
      ['Tipo Juzgado', safe(p.juzgado)],
      ['Número de Radicación', safe(p.radicado)],
      ['Estado del Proceso', safe(p.estadoProceso)],
      ['Demandante', safe(p.demandante)],
      ['Demandado', safe(p.demandado)],
      ['Valor', formatCurrency(p.valor)],
      ['Departamento', safe(p.departamento)],
      ['Ciudad', safe(p.ciudad)],
      ['Dirección Juzgado', safe(p.direccionJuzgado)]
    ];

    detalleRows.forEach(row => {
      body.push([
        { text: row[0], fontSize: 8, margin: [4, 2, 2, 2] },
        { text: row[1], fontSize: 8, margin: [4, 2, 2, 2] }
      ]);
    });

    // ✅ Tabla completa del proceso
    c.push({
      table: { 
        widths: ['*', '*'], 
        body
      },
      layout: standardTableLayout,
      margin: [15, 0, 0, 10]
    });
  });
}


  // ========== 6. OBLIGACIONES ALIMENTARIAS ==========
  c.push({ 
    text: '6. OBLIGACIONES ALIMENTARIAS', 
    fontSize: 9,
    bold: true,
    margin: [0, 6, 0, 6]
  });

if (!obligacionesAlimentarias.length) {
  c.push({ 
    text: 'No se reportan obligaciones alimentarias.', 
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });
} else {
  obligacionesAlimentarias.forEach((o, idx) => {
    const body = [];

    // ✅ Primera fila: título centrado con colSpan
    body.push([
      { 
        text: `Obligación Alimentaria No. ${idx + 1}`, 
        bold: true, 
        fontSize: 9, 
        alignment: 'center', 
        margin: [0, 4, 0, 4],
        colSpan: 2 
      }, 
      {}
    ]);

    // ✅ Filas de detalle
    const detalleRows = [
      ['Beneficiario', safe(o.beneficiario)],
      ['Tipo de Identificación', safe(o.tipoIdentificacion)],
      ['Número de Identificación', safe(o.numeroIdentificacion)],
      ['Parentesco', safe(o.parentesco)],
      ['Cuantía Mensual', formatCurrency(o.cuantia)],
      ['Periodo de Pago', safe(o.periodoPago)],
      ['Estado de la Obligación', safe(o.estadoObligacion)],
      ['¿La obligación se encuentra demandada?', o.obligacionDemandada ? 'SI' : 'NO'],
      ['País de Residencia', safe(o.paisResidencia)],
      ['Departamento', safe(o.departamento)],
      ['Ciudad', safe(o.ciudad)],
      ['Dirección', safe(o.direccion)],
      ['Correo Electrónico del Beneficiario', safe(o.emailBeneficiario)]
    ];

    detalleRows.forEach(row => {
      body.push([
        { text: row[0], fontSize: 8, margin: [4, 2, 2, 2] },
        { text: row[1], fontSize: 8, margin: [4, 2, 2, 2] }
      ]);
    });

    // ✅ Agregar la tabla de obligación alimentaria
    c.push({
      table: { 
        widths: ['*', '*'], 
        body
      },
      layout: standardTableLayout,
      margin: [15, 0, 0, 10]
    });
  });
}

  // ========== 7. RELACIÓN DE GASTOS ==========
c.push({ 
  text: '7. RELACIÓN DE GASTOS DE SUBSISTENCIA DEL DEUDOR Y DE PERSONAS A SU CARGO:', 
  fontSize: 9,
  bold: true,
  margin: [0, 6, 0, 6]
});

const bodyGastos = [];

// ✅ Título de sección como celda única centrada
bodyGastos.push([
  { 
    text: 'Gastos de Subsistencia', 
    bold: true, 
    fontSize: 9, 
    alignment: 'center', 
    margin: [0, 4, 0, 4],
    colSpan: 2 
  }, 
  {}
]);

// ✅ Mapeo de etiquetas
const gastosLabels = {
  alimentacion: 'Alimentación',
  salud: 'Salud',
  arriendo: 'Arriendo o Cuota Vivienda',
  serviciosPublicos: 'Servicios Públicos',
  educacion: 'Educación',
  transporte: 'Transporte',
  conservacionBienes: 'Conservación de Bienes',
  cuotaLeasingHabitacional: 'Cuota De Leasing Habitacional',
  arriendoOficina: 'Arriendo Oficina/Consultorio',
  cuotaSeguridadSocial: 'Cuota De Seguridad Social',
  cuotaAdminPropiedadHorizontal: 'Cuota De Administración Propiedad Horizontal',
  cuotaLeasingVehiculo: 'Cuota De Leasing Vehículo',
  cuotaLeasingOficina: 'Cuota De Leasing Oficina/Consultorio',
  seguros: 'Seguros',
  vestuario: 'Vestuario',
  recreacion: 'Recreación',
  gastosPersonasCargo: 'Gastos Personas a Cargo',
  otros: 'Otros Gastos',
};

// ✅ Construcción dinámica de filas
const gastosPersonales = infoFin.gastosPersonales || {};
let totalGastos = 0;

for (const key in gastosPersonales) {
  const value = parseFloat(gastosPersonales[key]);
  if (value > 0 && gastosLabels[key]) {
    bodyGastos.push([
      { text: gastosLabels[key], fontSize: 8, margin: [4, 2, 2, 2] },
      { text: formatCurrency(value), fontSize: 8, margin: [4, 2, 2, 2] }
    ]);
    totalGastos += value;
  }
}

// ✅ Si no hay gastos reportados
if (bodyGastos.length === 1) {
  bodyGastos.push([
    { text: 'No se reportan gastos.', fontSize: 8, margin: [4, 2, 2, 2], colSpan: 2, alignment: 'center' },
    {}
  ]);
} else {
  // ✅ Fila de total
  bodyGastos.push([
    { text: 'TOTAL GASTOS', bold: true, fontSize: 8, margin: [4, 2, 2, 2] },
    { text: formatCurrency(totalGastos), bold: true, fontSize: 8, margin: [4, 2, 2, 2] }
  ]);
}

// ✅ Agregar la tabla final al contenido
c.push({
  table: { 
    widths: ['*', '*'], 
    body: bodyGastos
  },
  layout: standardTableLayout,
  margin: [15, 0, 0, 8]
});

  // ========== 8. RELACIÓN DE INGRESOS ==========

  c.push({ 
  text: '8. RELACIÓN DE INGRESOS:', 
  fontSize: 9,
  bold: true,
  margin: [0, 6, 0, 6]
});

const bodyIngresos = [];

// ✅ Título de sección como una celda única centrada
bodyIngresos.push([
  { 
    text: 'Ingresos', 
    bold: true, 
    fontSize: 9, 
    alignment: 'center', 
    margin: [0, 4, 0, 4],
    colSpan: 2 
  },
  {}
]);

// ✅ Manejo de tipos de datos seguros
const actPrincipal = Number(infoFin.ingresosActividadPrincipal);

// Si ingresosOtrasActividades es numérico, lo sumamos; si no, no
const otrasActividades = isNaN(Number(infoFin.ingresosOtrasActividades))
  ? infoFin.ingresosOtrasActividades
  : Number(infoFin.ingresosOtrasActividades);

const ingresosMensuales = typeof otrasActividades === 'number'
  ? actPrincipal + otrasActividades
  : actPrincipal;

// ✅ Definición de filas
const ingresosRows = [
  ['Ingresos mensuales por actividad económica', formatCurrency(actPrincipal)],
  ['Empleo', infoFin.tieneEmpleo ? 'SI' : 'NO'],
  ['Tipo de empleo', safe(infoFin.tipoEmpleo)],
  ['Descripción de la actividad económica', safe(infoFin.descripcionActividadEconomica)],
  ['Ingresos mensuales por otras actividades', safe(infoFin.ingresosOtrasActividades)]
];

// ✅ Añadimos las filas normales
ingresosRows.forEach(row => {
  bodyIngresos.push([
    { text: row[0], fontSize: 8, margin: [4, 2, 2, 2] },
    { text: row[1], fontSize: 8, margin: [4, 2, 2, 2] }
  ]);
});

// ✅ Fila final de total
bodyIngresos.push([
  { text: 'TOTAL DE INGRESOS MENSUALES', bold: true, fontSize: 8, margin: [4, 2, 2, 2] },
  { text: typeof otrasActividades === 'number' 
      ? formatCurrency(ingresosMensuales) 
      : formatCurrency(actPrincipal),
    bold: true, fontSize: 8, margin: [4, 2, 2, 2] }
]);

// ✅ Agregamos la tabla completa al PDF
c.push({
  table: {
    widths: ['*', '*'],
    body: bodyIngresos
  },
  layout: standardTableLayout,
  margin: [15, 0, 0, 8]
});

    // ========== 9. INFORMACIÓN SOBRE SOCIEDAD CONYUGAL ==========
c.push({ 
  text: '9. INFORMACIÓN SOBRE SOCIEDAD CONYUGAL O PATRIMONIAL:', 
  fontSize: 9,
  bold: true,
  margin: [0, 6, 0, 6]
});

const sociedadConyugal = solicitud.sociedadConyugal || {};
const conyugalRows = [];

// 🔹 Fila de encabezado unificada
conyugalRows.push([
  { 
    text: 'Sociedad Conyugal o Patrimonial',
    colSpan: 2,
    alignment: 'center',
    bold: true,
    fontSize: 9,
    margin: [0, 3, 0, 3]
  },
  {}
]);

// 🔹 Filas según condiciones
if (sociedadConyugal.activa) {
  conyugalRows.push([
    { text: 'Tengo o he tenido sociedad conyugal o patrimonial vigente', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: 'Sí', fontSize: 9, margin: [2, 1, 2, 1] }
  ]);

  conyugalRows.push([
    { text: 'La sociedad conyugal o patrimonial está disuelta pero no liquidada', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: sociedadConyugal.disuelta ? 'Sí' : 'No', fontSize: 9, margin: [2, 1, 2, 1] }
  ]);

  conyugalRows.push([
    { text: 'Nombres y Apellidos del Cónyuge', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: safe(sociedadConyugal.nombreConyuge), fontSize: 9, margin: [2, 1, 2, 1] }
  ]);

  conyugalRows.push([
    { text: 'Tipo de Documento', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: safe(sociedadConyugal.tipoDocConyuge), fontSize: 9, margin: [2, 1, 2, 1] }
  ]);

  conyugalRows.push([
    { text: 'Número de Documento', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: safe(sociedadConyugal.numDocConyuge), fontSize: 9, margin: [2, 1, 2, 1] }
  ]);
} else {
  conyugalRows.push([
    { text: 'Tengo o he tenido sociedad conyugal o patrimonial vigente', fontSize: 9, margin: [2, 1, 2, 1] },
    { text: 'No', fontSize: 9, margin: [2, 1, 2, 1] }
  ]);
}

// 🔹 Construcción final de tabla
c.push({
  table: {
    widths: ['*', '*'],
    body: conyugalRows
  },
  layout: standardTableLayout,
  margin: [15, 0, 0, 15]
});

// ====== 10. PROPUESTA DE PAGO ======
c.push({
  text: '10. PROPUESTA DE PAGO:',
  fontSize: 9,
  bold: true,
  margin: [0, 0, 0, 6],
});

if (!propuestaPago || propuestaPago.tipoNegociacion !== 'proyeccion') {
  c.push({
    text: 'No se presenta una propuesta de pago proyectada.',
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });
} else {
  const getClassFromNaturaleza = (naturaleza) => {
    if (!naturaleza) return 'QUINTA CLASE';
    if (naturaleza.toUpperCase().includes('PRIMERA CLASE')) return 'PRIMERA CLASE';
    if (naturaleza.toUpperCase().includes('SEGUNDA CLASE')) return 'SEGUNDA CLASE';
    if (naturaleza.toUpperCase().includes('TERCERA CLASE')) return 'TERCERA CLASE';
    if (naturaleza.toUpperCase().includes('CUARTA CLASE')) return 'CUARTA CLASE';
    return 'QUINTA CLASE';
  };

  const classOrder = ['PRIMERA CLASE', 'SEGUNDA CLASE', 'TERCERA CLASE', 'CUARTA CLASE', 'QUINTA CLASE'];
  const groupedAcreencias = acreencias.reduce((acc, a) => {
    const aClass = getClassFromNaturaleza(a.naturalezaCredito);
    if (!acc[aClass]) {
      acc[aClass] = [];
    }
    acc[aClass].push(a);
    return acc;
  }, {});

  classOrder.forEach(className => {
    if (groupedAcreencias[className]) {
      const classAcreencias = groupedAcreencias[className];
      const classTotalCapital = classAcreencias.reduce((s, a) => s + (Number(a.capital) || 0), 0);

      // --- Encabezados ---
      c.push({
        text: 'CRÉDITOS PRINCIPALES',
        fontSize: 10,
        bold: true,
        alignment: 'center',
        margin: [0, 6, 0, 2]
      });

      c.push({
        text: className,
        fontSize: 9,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 6]
      });

      // ===== Variables base =====
      const capital = classTotalCapital;
      const plazo = parseInt(propuestaPago.plazo, 10);
      const interesEA = parseFloat(propuestaPago.interesEA);
      const interesMensual = (Math.pow(1 + interesEA / 100, 1 / 12) - 1) * 100;
      const monthlyRate = interesMensual / 100;
      const startDate = new Date(propuestaPago.fechaInicioPago.$date || propuestaPago.fechaInicioPago);
      const diaPago = parseInt(propuestaPago.diaPago, 10) || 1;
      const formaPago = propuestaPago.formaPago;

      // ===== Tabla de detalle general =====
      const detalleBody = [
        [
          {
            text: `Tabla de Detalle de Proyección - ${className}`,
            colSpan: 2,
            alignment: 'center',
            bold: true,
            fontSize: 9,
            margin: [0, 3, 0, 3]
          },
          {}
        ],
        [
          { text: 'Capital Adeudado', bold: true, fontSize: 9 },
          { text: formatCurrency(capital), fontSize: 9, alignment: 'right' }
        ],
        [
          { text: 'Fecha de Inicio', bold: true, fontSize: 9 },
          { text: formatDate(startDate), fontSize: 9, alignment: 'right' }
        ],
        [
          { text: 'Forma de Pago', bold: true, fontSize: 9 },
          { text: formaPago || 'Cuota Fija', fontSize: 9, alignment: 'right' }
        ],
        [
          { text: 'Plazo de Pago (Meses)', bold: true, fontSize: 9 },
          { text: `${plazo}`, fontSize: 9, alignment: 'right' }
        ],
        [
          { text: 'Interés Efectivo Anual (EA)', bold: true, fontSize: 9 },
          { text: `${interesEA.toFixed(2)} %`, fontSize: 9, alignment: 'right' }
        ],
        [
          { text: 'Interés Nominal Mensual', bold: true, fontSize: 9 },
          { text: `${interesMensual.toFixed(4)} %`, fontSize: 9, alignment: 'right' }
        ]
      ];

      c.push({
        table: { widths: ['*', '*'], body: detalleBody },
        layout: standardTableLayout,
        margin: [15, 0, 0, 10]
      });

      // ===== Calcular proyección =====
      let cuotaFija = 0;
      if (monthlyRate > 0) {
        cuotaFija = capital * (monthlyRate * Math.pow(1 + monthlyRate, plazo)) / (Math.pow(1 + monthlyRate, plazo) - 1);
      } else {
        cuotaFija = capital / plazo;
      }

      // ===== Tabla de distribución unificada =====
      const distribBody = [
        [
          {
            text: `Distribución de la cuota fija - ${className}`,
            colSpan: 5,
            alignment: 'center',
            bold: true,
            fontSize: 9,
            margin: [0, 3, 0, 3]
          },
          {}, {}, {}, {}
        ],
        [
          {
            text: 'Cuota fija de pago:',
            bold: true,
            fontSize: 9
          },
          {
            text: formatCurrency(cuotaFija),
            bold: true,
            fontSize: 9,
            colSpan: 4
          },
          {}, {}, {}
        ],
        [
          { text: 'Acreedor', bold: true, fontSize: 8 },
          { text: 'Descripción', bold: true, fontSize: 8 },
          { text: 'Capital Actualizado', bold: true, fontSize: 8, alignment: 'right' },
          { text: 'Porcentaje', bold: true, fontSize: 8, alignment: 'center' },
          { text: 'Distribución', bold: true, fontSize: 8, alignment: 'right' }
        ]
      ];

      classAcreencias.forEach(a => {
        const cap = Number(a.capital);
        const porcentaje = capital > 0 ? (cap / capital) * 100 : 0;
        const distrib = cuotaFija * (porcentaje / 100);
        const nombreAcreedor = (a.acreedor && (typeof a.acreedor === 'object' ? a.acreedor.nombre : a.acreedor)) || 'No reporta';
        const descripcion = safe(a.descripcionCredito, 'No reporta');

        distribBody.push([
          { text: nombreAcreedor, fontSize: 8 },
          { text: descripcion, fontSize: 8 },
          { text: formatCurrency(cap), fontSize: 8, alignment: 'right' },
          { text: `${porcentaje.toFixed(2)}%`, fontSize: 8, alignment: 'center' },
          { text: formatCurrency(distrib), fontSize: 8, alignment: 'right' }
        ]);
      });

      c.push({
        table: {
          widths: ['*', 120, 90, 50, 90],
          body: distribBody
        },
        layout: standardTableLayout,
        margin: [15, 0, 0, 12]
      });

      // ===== Tabla de Proyección =====
      let saldo = capital;
      const projectionData = [];
      for (let i = 1; i <= plazo; i++) {
        const pagoInteres = saldo * monthlyRate;
        const pagoCapital = cuotaFija - pagoInteres;
        const saldoFinal = saldo - pagoCapital;

        const fechaPago = new Date(startDate);
        fechaPago.setMonth(startDate.getMonth() + i - 1);
        fechaPago.setDate(diaPago);

        projectionData.push({
          pagoNo: i,
          saldoCapital: formatCurrency(saldo),
          pagoCapital: formatCurrency(pagoCapital),
          pagoInteres: formatCurrency(pagoInteres),
          montoPago: formatCurrency(cuotaFija),
          saldoFinalCapital: formatCurrency(Math.max(saldoFinal, 0)),
          plazoDias: plazo,
          fecha: fechaPago.toLocaleDateString('es-CO')
        });

        saldo = saldoFinal;
      }
      
      const proyeccionBody = [
        [
          {
            text: `Tabla de Proyección de Pagos - ${className}`,
            bold: true,
            fontSize: 9,
            alignment: 'center',
            colSpan: 8,
            margin: [0, 2, 0, 2]
          },
          {}, {}, {}, {}, {}, {}, {}
        ],
        [
          { text: 'Pago No.', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Saldo Capital', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Pago Capital', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Pago Interés', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Monto de Pago', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Saldo Final Capital', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Plazo en días', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'Fecha', bold: true, fontSize: 7, alignment: 'center' }
        ]
      ];

      projectionData.forEach(p => {
        proyeccionBody.push([
          { text: p.pagoNo.toString(), fontSize: 7, alignment: 'center' },
          { text: p.saldoCapital, fontSize: 7, alignment: 'right' },
          { text: p.pagoCapital, fontSize: 7, alignment: 'right' },
          { text: p.pagoInteres, fontSize: 7, alignment: 'right' },
          { text: p.montoPago, fontSize: 7, alignment: 'right' },
          { text: p.saldoFinalCapital, fontSize: 7, alignment: 'right' },
          { text: p.plazoDias.toString(), fontSize: 7, alignment: 'center' },
          { text: p.fecha, fontSize: 7, alignment: 'center' }
        ]);
      });

      c.push({
        table: {
          widths: [25, '*', '*', '*', '*', '*', 30, '*'],
          body: proyeccionBody
        },
        layout: standardTableLayout,
        margin: [15, 0, 0, 12]
      });
    }
  });
}

  // ========== 11. SOLICITUD SOBRE LA TARIFA ==========
  c.push({ 
    text: '11. SOLICITUD SOBRE LA TARIFA:', 
    fontSize: 9,
    bold: true,
    margin: [0, 6, 0, 6]
  });
  
  c.push({
    text: 'Atendiendo las tarifas contenidas en el Decreto 2677 de 2012, por las condiciones de insolvencia económica en que me encuentro, con el debido respeto y con fundamento en el Articulo 536 de la Ley 1564 de 2012, le solicito fijar una tarifa que me permita tener acceso a este procedimiento de insolvencia económica de la persona natural no comerciante',
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });

  // ========== 12. FUNDAMENTOS DE DERECHO ==========
  c.push({ 
    text: '12. FUNDAMENTOS DE DERECHO:', 
    fontSize: 9,
    bold: true,
    margin: [0, 6, 0, 6]
  });
  
  c.push({
    text: 'La presente solicitud de Insolvencia Económica de la Persona Natural No Comerciante se encuentra fundamentada conforme al Titulo IV de la Ley 1564 de 2012, Decreto Reglamentario 1069 de 2015 y demás disposiciones complementarias y conducentes.',
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 8]
  });

  // ========== 13. ANEXOS ==========
  c.push({ 
    text: '13. ANEXOS:', 
    fontSize: 9,
    bold: true,
    margin: [0, 6, 0, 6]
  });
  
  c.push({
    text: 'Para efectos del cumplimiento de los requisitos exigidos, se anexan los siguientes documentos:',
    fontSize: 9,
    alignment: 'justify',
    margin: [15, 0, 0, 3]
  });
  
  c.push({
    text: '13.1 Otros anexos',
    fontSize: 9,
    margin: [15, 3, 0, 1]
  });
  
  const anexos = solicitud.anexos || ['ANEXOS - ' + (nombreCompleto || 'DEUDOR').toUpperCase()];
  anexos.forEach(anexo => {
    c.push({
      text: `     • ${anexo.filename}`,
      fontSize: 9,
      margin: [15, 1, 0, 1]
    });
  });

  // ========== 14. NOTIFICACIONES ==========
  c.push({ 
    text: '14. NOTIFICACIONES', 
    fontSize: 9,
    bold: true,
    margin: [0, 8, 0, 6]
  });

  c.push({
    text: 'Deudor',
    fontSize: 9,
    bold: true,
    margin: [15, 0, 0, 1]
  });
  
  c.push({ text: nombreCompleto, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `País: Colombia`, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `Departamento: ${safe(deudor.departamento)}`, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `Ciudad: ${safe(deudor.ciudad)}`, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `Dirección: ${safe(deudor.domicilio)}`, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `Teléfono / Celular: ${safe(deudor.telefono)}`, fontSize: 9, margin: [15, 0, 0, 1] });
  c.push({ text: `Correo electrónico: ${safe(deudor.email)}`, fontSize: 9, margin: [15, 0, 0, 3] });

  c.push({
    text: 'Acreedores: Mis acreedores recibirán las notificaciones según las indicaciones que he suministrado para cada uno.',
    fontSize: 9,
    margin: [15, 3, 0, 8]
  });

  // ========== FIRMA ==========
  c.push({
    text: 'Atentamente,',
    fontSize: 9,
    margin: [0, 8, 0, 20]
  });
  
  c.push({
    text: nombreCompleto,
    fontSize: 9,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 1]
  });
  
  c.push({
    text: safe(deudor.email),
    fontSize: 9,
    alignment: 'center',
    margin: [0, 0, 0, 1]
  });
  
  c.push({
    text: `Fecha: ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'numeric', year: 'numeric' })} - ${new Date().toLocaleTimeString('es-CO')}`,
    fontSize: 9,
    alignment: 'center',
    margin: [0, 0, 0, 1]
  });
  
  c.push({
    text: 'C.C. ' + safe(deudor.cedula),
    fontSize: 9,
    alignment: 'center',
    margin: [0, 0, 0, 1]
  });
  
  c.push({
    text: 'Deudor(a)',
    fontSize: 9,
    alignment: 'center',
    margin: [0, 0, 0, 0]
  });

  return docDefinition;
}

// -------------------- Generador Principal --------------------
async function generateSolicitudPdf(solicitud = {}) {
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(solicitud);
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

// -------------------- Exports --------------------
module.exports = { generateSolicitudPdf };