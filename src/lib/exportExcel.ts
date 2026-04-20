import * as XLSX from 'xlsx';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExcelColumn[],
  fileName: string,
  sheetName = 'Rapport'
) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ''));

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map((c) => ({ wch: c.width || 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
