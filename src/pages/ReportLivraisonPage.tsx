import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ReportPanel, type ReportColumn } from '@/components/features/ReportPanel';
import { formatNumber, formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { Truck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReportLivraisonPage() {
  const { livraisons } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF } = useSettingsStore();

  const data = useMemo(
    () =>
      livraisons.map((l) => ({
        id: l.id,
        date: l.date,
        livreur_nom: l.livreur_nom,
        produit_nom: l.produit_nom,
        sortie: l.sortie,
        retour: l.retour,
        bonus: l.bonus,
        vente: l.vente,
        ventes_cash: l.ventes_cash,
        ventes_credit: l.ventes_credit,
        recouvrements: l.recouvrements,
        montant_attendu: l.montant_attendu,
        total_vendu: l.total_vendu,
        net_verse: l.net_verse,
        coherent: l.total_vendu === l.montant_attendu,
      })),
    [livraisons]
  );

  const columns: ReportColumn[] = [
    { header: 'Date', key: 'date', width: 14 },
    {
      header: 'Livreur',
      key: 'livreur_nom',
      width: 16,
      render: (v) => <span className="font-medium">{String(v)}</span>,
    },
    { header: 'Produit', key: 'produit_nom', width: 20 },
    { header: 'Sortie', key: 'sortie', align: 'right', width: 10 },
    { header: 'Retour', key: 'retour', align: 'right', width: 10 },
    { header: 'Bonus', key: 'bonus', align: 'right', width: 10 },
    {
      header: 'Vente',
      key: 'vente',
      align: 'right',
      width: 10,
      render: (v) => <span className="font-semibold">{formatNumber(Number(v))}</span>,
    },
    {
      header: 'Cash',
      key: 'ventes_cash',
      align: 'right',
      width: 14,
      render: (v) => formatMoney(Number(v)),
    },
    {
      header: 'Crédit',
      key: 'ventes_credit',
      align: 'right',
      width: 14,
      render: (v) => formatMoney(Number(v)),
    },
    {
      header: 'Attendu',
      key: 'montant_attendu',
      align: 'right',
      width: 14,
      render: (v) => (
        <div>
          <span className="font-semibold">{formatMoney(Number(v))}</span>
          <span className="block text-[10px] text-muted-foreground">≈ {formatUSD(fcToUsd(Number(v), TAUX_USD_CDF))}</span>
        </div>
      ),
    },
    {
      header: 'Statut',
      key: 'coherent',
      align: 'center',
      width: 10,
      render: (v) =>
        v ? (
          <Badge variant="secondary" className="bg-production-light text-production-dark text-xs border-0">OK</Badge>
        ) : (
          <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="size-3" />Écart</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-livraison/10">
          <Truck className="size-5 text-livraison" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Rapport Livraison</h2>
          <p className="text-sm text-muted-foreground">Historique complet des livraisons et ventes</p>
        </div>
      </div>

      <ReportPanel
        title="Historique Livraisons"
        data={data}
        columns={columns}
        fileName="rapport-livraison"
        accentClass="bg-livraison hover:bg-livraison-dark"
        filterKeys={['livreur_nom', 'produit_nom']}
        icon={<Truck className="size-4 text-livraison" />}
      />
    </div>
  );
}
