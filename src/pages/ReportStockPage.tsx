import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ReportPanel, type ReportColumn } from '@/components/features/ReportPanel';
import { formatNumber } from '@/lib/utils';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ReportStockPage() {
  const { stockMouvements } = useDataStore();

  const data = useMemo(
    () =>
      stockMouvements.map((m) => ({
        id: m.id,
        date: m.date,
        produit_nom: m.produit_nom,
        type: m.type,
        quantite: m.quantite,
        source: m.source,
        reference_id: m.reference_id,
      })),
    [stockMouvements]
  );

  const columns: ReportColumn[] = [
    { header: 'Date', key: 'date', width: 14 },
    {
      header: 'Produit',
      key: 'produit_nom',
      width: 22,
      render: (v) => <span className="font-medium">{String(v)}</span>,
    },
    {
      header: 'Type',
      key: 'type',
      width: 14,
      render: (v) => {
        const t = String(v);
        return (
          <Badge
            className={cn(
              'text-xs border-0',
              t === 'entree' ? 'bg-production text-white' : t === 'sortie' ? 'bg-destructive text-white' : 'bg-muted-foreground text-white'
            )}
          >
            {t === 'entree' ? '↑ Entrée' : t === 'sortie' ? '↓ Sortie' : '⊘ Décl.'}
          </Badge>
        );
      },
    },
    {
      header: 'Quantité',
      key: 'quantite',
      align: 'right',
      width: 12,
      render: (v, row) => {
        const t = String(row.type);
        return (
          <span className={cn('font-semibold', t === 'entree' ? 'text-production' : 'text-destructive')}>
            {t === 'entree' ? '+' : '−'}{formatNumber(Number(v))}
          </span>
        );
      },
    },
    {
      header: 'Source',
      key: 'source',
      width: 16,
      render: (v) => <span className="capitalize text-muted-foreground">{String(v)}</span>,
    },
    { header: 'Réf.', key: 'reference_id', width: 14 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-stock/10">
          <Package className="size-5 text-stock" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Rapport Stock</h2>
          <p className="text-sm text-muted-foreground">Historique complet des mouvements de stock</p>
        </div>
      </div>

      <ReportPanel
        title="Historique Mouvements Stock"
        data={data}
        columns={columns}
        fileName="rapport-stock"
        accentClass="bg-stock hover:bg-stock-dark"
        filterKeys={['produit_nom', 'type', 'source']}
        icon={<Package className="size-4 text-stock" />}
      />
    </div>
  );
}
