import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ReportPanel, type ReportColumn } from '@/components/features/ReportPanel';
import { formatNumber } from '@/lib/utils';
import { Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReportProductionPage() {
  const { productions } = useDataStore();

  const data = useMemo(
    () =>
      productions.map((p) => ({
        id: p.id,
        date: p.date,
        equipe_nom: p.equipe_nom,
        produit_nom: p.produit_nom,
        quantite: p.quantite,
        user_email: p.user_email,
      })),
    [productions]
  );

  const columns: ReportColumn[] = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Équipe', key: 'equipe_nom', width: 16 },
    {
      header: 'Produit',
      key: 'produit_nom',
      width: 22,
      render: (v) => <span className="font-medium">{String(v)}</span>,
    },
    {
      header: 'Quantité',
      key: 'quantite',
      align: 'right',
      width: 12,
      render: (v) => <span className="font-semibold">{formatNumber(Number(v))}</span>,
    },
    {
      header: 'Opérateur',
      key: 'user_email',
      width: 24,
      render: (v) => <Badge variant="secondary" className="text-xs">{String(v)}</Badge>,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-production/10">
          <Factory className="size-5 text-production" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Rapport Production</h2>
          <p className="text-sm text-muted-foreground">Historique complet des entrées de production</p>
        </div>
      </div>

      <ReportPanel
        title="Historique Production"
        data={data}
        columns={columns}
        fileName="rapport-production"
        accentClass="bg-production hover:bg-production-dark"
        filterKeys={['equipe_nom', 'produit_nom', 'user_email']}
        icon={<Factory className="size-4 text-production" />}
      />
    </div>
  );
}
