import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import XLSX from 'xlsx-js-style';

const PDF_VERDE_PRINCIPAL  = [27,  94,  32];
const PDF_VERDE_ACENTO     = [76, 175,  80];
const PDF_VERDE_SUBFONDO   = [232, 245, 233];
const PDF_GRIS_BORDE       = [189, 189, 189];
const PDF_GRIS_TEXTO       = [66,  66,  66];
const PDF_GRIS_CLARO       = [158, 158, 158];
const PDF_BANNER_TEXTO_SEC = [178, 223, 183];
const PDF_BORDE_ENCABEZADO = [21,  70,  24];

const XLS_VERDE_PRINCIPAL  = '1B5E20';
const XLS_VERDE_ACENTO     = '4CAF50';
const XLS_VERDE_ENC        = '228B22';
const XLS_VERDE_ALT        = 'E6F5E6';
const XLS_VERDE_ESTADO     = 'C8E6C9';
const XLS_VERDE_ESTADO_TXT = '1B5E20';
const XLS_ROJO_ESTADO      = 'FFCDD2';
const XLS_ROJO_ESTADO_TXT  = 'B71C1C';
const XLS_BLANCO           = 'FFFFFF';

const SISTEMA_NOMBRE    = 'Sociedad Agrícola Arona S.A.';
const SISTEMA_SUBTITULO = 'Sistema de Gestión Agrícola';

function formatFecha(d) {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatHora(d) {
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatStamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export async function exportUsuariosPdf(usuarios) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now = new Date();
  const fechaTxt = formatFecha(now);
  const horaTxt = formatHora(now);
  const stamp = formatStamp(now);

  const bannerH = 30;
  doc.setFillColor(...PDF_VERDE_PRINCIPAL);
  doc.rect(0, 0, pageW, bannerH, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE USUARIOS', 16, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_BANNER_TEXTO_SEC);
  doc.text(SISTEMA_NOMBRE, 16, 20);
  doc.text(SISTEMA_SUBTITULO, 16, 26);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Generado:', pageW - 14, 11, { align: 'right' });
  doc.text('Registros:', pageW - 14, 19, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_BANNER_TEXTO_SEC);
  doc.text(`${fechaTxt}  ${horaTxt}`, pageW - 14, 15, { align: 'right' });
  doc.text(String(usuarios.length), pageW - 14, 23, { align: 'right' });

  doc.setFillColor(...PDF_VERDE_ACENTO);
  doc.rect(0, bannerH, pageW, 4, 'F');

  const encabezados = [['ID', 'Nombre Completo', 'DNI', 'Teléfono', 'Dirección', 'Correo', 'Rol', 'Área', 'Estado']];
  const filas = usuarios.map((u, i) => [
    String(u.id ?? u.idUsuario ?? i + 1),
    u.nombreCompleto || `${u.nombres || ''} ${u.apellidos || ''}`.trim() || '-',
    u.dni ?? '-',
    u.telefono ?? '-',
    u.direccion ?? '-',
    u.correo ?? '-',
    u.rol ?? '-',
    u.area ?? '-',
    u.estado ? 'Activo' : 'Inactivo'
  ]);

  autoTable(doc, {
    head: encabezados,
    body: filas,
    startY: bannerH + 6,
    margin: { left: 14, right: 14 },
    tableWidth: 264,
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      overflow: 'linebreak',
      lineColor: PDF_GRIS_BORDE,
      lineWidth: 0.3,
      textColor: PDF_GRIS_TEXTO
    },
    headStyles: {
      fillColor: PDF_VERDE_PRINCIPAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      lineColor: PDF_BORDE_ENCABEZADO,
      lineWidth: 0.4
    },
    alternateRowStyles: {
      fillColor: PDF_VERDE_SUBFONDO
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 44 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 38 },
      5: { cellWidth: 52 },
      6: { cellWidth: 30, halign: 'center' },
      7: { cellWidth: 30, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const activo = String(data.cell.raw ?? '') === 'Activo';
        data.cell.styles.fillColor = activo ? [200, 230, 201] : [255, 205, 210];
        data.cell.styles.textColor = activo ? [27, 94, 32] : [183, 28, 28];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: () => {
      const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.getNumberOfPages();
      doc.setDrawColor(...PDF_GRIS_BORDE);
      doc.setLineWidth(0.3);
      doc.line(14, pageH - 10, pageW - 14, pageH - 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_GRIS_CLARO);
      doc.text(
        `Arona Sistema Agrícola  •  Documento generado automáticamente  •  ${fechaTxt} ${horaTxt}`,
        pageW / 2, pageH - 6, { align: 'center' }
      );
      doc.text(`Página ${pageNum} de ${pageCount}`, pageW - 14, pageH - 6, { align: 'right' });
    }
  });

  doc.save(`usuarios_arona_${stamp}.pdf`);
}

export async function exportUsuariosExcel(usuarios) {
  const now = new Date();
  const stamp = formatStamp(now);
  const fechaTxt = formatFecha(now);
  const horaTxt = formatHora(now);

  const encabezados = ['ID', 'Nombre Completo', 'DNI', 'Teléfono', 'Dirección', 'Correo', 'Rol', 'Área', 'Estado'];
  const filas = usuarios.map((u) => [
    u.id ?? u.idUsuario ?? '',
    u.nombreCompleto || `${u.nombres || ''} ${u.apellidos || ''}`.trim() || '',
    u.dni ?? '',
    u.telefono ?? '',
    u.direccion ?? '',
    u.correo,
    u.rol ?? '',
    u.area ?? '',
    u.estado ? 'Activo' : 'Inactivo'
  ]);

  const tituloFila = [`${SISTEMA_NOMBRE} — Reporte de Usuarios`];
  const subtituloFila = [`Generado: ${fechaTxt} ${horaTxt}   |   Total de registros: ${usuarios.length}`];
  const separador = [];

  const wsData = [tituloFila, subtituloFila, separador, encabezados, ...filas];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const maxWidths = [6, 35, 10, 12, 30, 38, 14, 15, 10];
  const minWidths = [4,  8,  5,  5,  8,  10,  5,  5,  8];

  ws['!cols'] = encabezados.map((h, ci) => {
    const contentMax = filas.reduce((m, r) => Math.max(m, String(r[ci] ?? '').length), h.length);
    const wch = Math.min(Math.max(contentMax + 2, minWidths[ci]), maxWidths[ci]);
    return { wch };
  });

  const lastCol = encabezados.length - 1;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } }
  ];

  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({ s: { r: 3, c: 0 }, e: { r: 3 + filas.length, c: lastCol } })
  };
  ws['!freeze'] = { xSplit: 0, ySplit: 4 };

  const cellRef = (row, col) => `${String.fromCharCode(65 + col)}${row + 1}`;
  const borde = { style: 'thin', color: { rgb: 'BDBDBD' } };
  const borderObj = { top: borde, bottom: borde, left: borde, right: borde };

  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 14, color: { rgb: XLS_BLANCO } },
      fill: { fgColor: { rgb: XLS_VERDE_PRINCIPAL }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  for (let c = 1; c < encabezados.length; c++) {
    const ref = cellRef(0, c);
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { fill: { fgColor: { rgb: XLS_VERDE_PRINCIPAL }, patternType: 'solid' } };
  }

  if (ws['A2']) {
    ws['A2'].s = {
      font: { italic: true, sz: 9, color: { rgb: XLS_BLANCO } },
      fill: { fgColor: { rgb: XLS_VERDE_ACENTO }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  for (let c = 1; c < encabezados.length; c++) {
    const ref = cellRef(1, c);
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = { fill: { fgColor: { rgb: XLS_VERDE_ACENTO }, patternType: 'solid' } };
  }

  for (let c = 0; c < encabezados.length; c++) {
    const ref = cellRef(3, c);
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, sz: 11, color: { rgb: XLS_BLANCO } },
      fill: { fgColor: { rgb: XLS_VERDE_ENC }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderObj
    };
  }

  for (let r = 0; r < filas.length; r++) {
    const bg = r % 2 === 1 ? XLS_VERDE_ALT : XLS_BLANCO;
    for (let c = 0; c < encabezados.length; c++) {
      const ref = cellRef(4 + r, c);
      if (!ws[ref]) continue;
      if (c === 8) {
        const esActivo = String(ws[ref].v ?? '') === 'Activo';
        ws[ref].s = {
          font: { bold: true, sz: 10, color: { rgb: esActivo ? XLS_VERDE_ESTADO_TXT : XLS_ROJO_ESTADO_TXT } },
          fill: { fgColor: { rgb: esActivo ? XLS_VERDE_ESTADO : XLS_ROJO_ESTADO }, patternType: 'solid' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderObj
        };
      } else {
        ws[ref].s = {
          fill: { fgColor: { rgb: bg }, patternType: 'solid' },
          alignment: { vertical: 'center', horizontal: c === 0 ? 'center' : 'left' },
          border: borderObj
        };
      }
    }
  }

  ws['!rows'] = [
    { hpt: 26 }, { hpt: 16 }, { hpt: 6 }, { hpt: 20 },
    ...Array(filas.length).fill({ hpt: 16 })
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
  XLSX.writeFile(wb, `usuarios_arona_${stamp}.xlsx`);
}
