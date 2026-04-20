import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfColumn {
  header: string;
  key: string;
}

export function exportToPdf(
  data: Record<string, unknown>[],
  columns: PdfColumn[],
  fileName: string,
  title: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  // Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  doc.text(
    `Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    14,
    25
  );

  const head = [columns.map((c) => c.header)];
  const body = data.map((row) => columns.map((c) => String(row[c.key] ?? '')));

  autoTable(doc, {
    head,
    body,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { overflow: 'linebreak' },
    margin: { top: 30, left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`PilotFlow — Page ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 8);
  }

  doc.save(`${fileName}.pdf`);
}
