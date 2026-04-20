import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ReportPanel, type ReportColumn } from '@/components/features/ReportPanel';
import { formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ReportFinancePage() {
  const { finances } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF } = useSettingsStore();

  const data = useMemo(
    () =>
      finances.map((f) => ({
        id: f.id,
        date: f.date,
        type: f.type,
        description: f.description,
        montant: f.montant,
        user_email: f.user_email,
        confirmed: f.confirmed,
      })),
    [finances]
  );

  const columns: ReportColumn[] = [
    { header: 'Date', key: 'date', width: 14 },
    {
      header: 'Type',
      key: 'type',
      width: 16,
      render: (v) => {
        const t = String(v);
        return (
          <Badge
            className={cn(
              'text-xs border-0',
              t === 'encaissement' ? 'bg-production text-white' : 'bg-destructive text-white'
            )}
          >
            {t === 'encaissement' ? '↓ Encaissement' : '↑ Dépense'}
          </Badge>
        );
      },
    },
    {
      header: 'Description',
      key: 'description',
      width: 32,
      render: (v) => <span className="max-w-xs truncate block">{String(v)}</span>,
    },
    {
      header: 'Montant',
      key: 'montant',
      align: 'right',
      width: 16,
      render: (v, row) => {
        const isEnc = row.type === 'encaissement';
        const amount = Number(v);
        return (
          <div>
            <span className={cn('font-semibold', isEnc ? 'text-production' : 'text-destructive')}>
              {isEnc ? '+' : '−'} {formatMoney(amount)}
            </span>
            <span className="block text-[10px] text-muted-foreground">≈ {formatUSD(fcToUsd(amount, TAUX_USD_CDF))}</span>
          </div>
        );
      },
    },
    {
      header: 'Statut',
      key: 'confirmed',
      align: 'center',
      width: 12,
      render: (v) =>
        v ? (
          <Badge variant="secondary" className="text-xs">Confirmé</Badge>
        ) : (
          <Badge className="bg-livraison-light text-livraison-dark text-xs border-0">En attente</Badge>
        ),
    },
    {
      header: 'Opérateur',
      key: 'user_email',
      width: 22,
      render: (v) => <Badge variant="secondary" className="text-xs">{String(v)}</Badge>,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-finance/10">
          <Wallet className="size-5 text-finance" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Rapport Finance</h2>
          <p className="text-sm text-muted-foreground">Historique complet des encaissements et dépenses</p>
        </div>
      </div>

      <ReportPanel
        title="Historique Finances"
        data={data}
        columns={columns}
        fileName="rapport-finance"
        accentClass="bg-finance hover:bg-finance-dark"
        filterKeys={['type', 'description', 'user_email']}
        icon={<Wallet className="size-4 text-finance" />}
      />
    </div>
  );
}
