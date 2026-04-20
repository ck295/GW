import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { formatDateFR } from '@/lib/dates';
import { exportToExcel, type ExcelColumn } from '@/lib/exportExcel';
import { exportToPdf, type PdfColumn } from '@/lib/exportPdf';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ReportColumn {
  header: string;
  key: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface ReportPanelProps {
  title: string;
  data: Record<string, unknown>[];
  columns: ReportColumn[];
  fileName: string;
  accentClass?: string;
  filterKeys?: string[];
  icon?: React.ReactNode;
}

const PAGE_SIZE = 20;

export function ReportPanel({
  title,
  data,
  columns,
  fileName,
  accentClass = 'bg-teal-500',
  filterKeys = [],
  icon,
}: ReportPanelProps) {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    let result = [...data].sort((a, b) => {
      const dA = String(a.date ?? '');
      const dB = String(b.date ?? '');
      return dB.localeCompare(dA);
    });

    if (dateFrom) result = result.filter((r) => String(r.date ?? '') >= dateFrom);
    if (dateTo) result = result.filter((r) => String(r.date ?? '') <= dateTo);

    if (search.trim()) {
      const q = search.toLowerCase();
      const keys = filterKeys.length > 0 ? filterKeys : columns.map((c) => c.key);
      result = result.filter((r) =>
        keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, search, dateFrom, dateTo, columns, filterKeys]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportExcel = () => {
    const excelCols: ExcelColumn[] = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width || 18,
    }));
    const exportData = filteredData.map((row) => {
      const mapped: Record<string, unknown> = {};
      columns.forEach((c) => {
        const val = row[c.key];
        if (c.key === 'date' && typeof val === 'string') {
          mapped[c.key] = formatDateFR(val);
        } else {
          mapped[c.key] = val;
        }
      });
      return mapped;
    });
    exportToExcel(exportData, excelCols, fileName);
    toast.success(`Export Excel généré — ${filteredData.length} ligne(s)`);
  };

  const handleExportPdf = () => {
    const pdfCols: PdfColumn[] = columns.map((c) => ({ header: c.header, key: c.key }));
    const exportData = filteredData.map((row) => {
      const mapped: Record<string, unknown> = {};
      columns.forEach((c) => {
        const val = row[c.key];
        if (c.key === 'date' && typeof val === 'string') {
          mapped[c.key] = formatDateFR(val);
        } else {
          mapped[c.key] = val;
        }
      });
      return mapped;
    });
    exportToPdf(exportData, pdfCols, fileName, title);
    toast.success(`Export PDF généré — ${filteredData.length} ligne(s)`);
  };

  return (
    <div className="rounded-xl bg-card shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs ml-1">
            {formatNumber(filteredData.length)} entrée(s)
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 text-xs h-8"
          >
            <Filter className="size-3.5" />
            Filtrer
          </Button>
          <Button size="sm" onClick={handleExportExcel} className={cn('gap-1.5 text-xs h-8 text-white', accentClass)}>
            <FileSpreadsheet className="size-3.5" />
            Excel
          </Button>
          <Button size="sm" onClick={handleExportPdf} className="gap-1.5 text-xs h-8 bg-red-600 hover:bg-red-700 text-white">
            <FileText className="size-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 border-b bg-muted/30 px-5 py-3 animate-fade-in">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Recherche</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Du</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-8 text-sm w-auto"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Au</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-8 text-sm w-auto"
            />
          </div>
          {(search || dateFrom || dateTo) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}
              className="text-xs h-8"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-muted-foreground">
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr key={String(row.id ?? idx)} className="border-b last:border-0 hover:bg-muted/30">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap',
                        col.align === 'right' && 'text-right tabular-nums',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : col.key === 'date' && typeof row[col.key] === 'string'
                          ? formatDateFR(row[col.key] as string)
                          : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages} — {filteredData.length} résultat(s)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors',
                    page === pageNum
                      ? `${accentClass} text-white shadow-sm`
                      : 'border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
