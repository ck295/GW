import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { LivraisonForm } from '@/components/features/LivraisonForm';
import { DateSelector } from '@/components/features/DateSelector';
import { today, formatDateFR, isInRange } from '@/lib/dates';
import { formatNumber, formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { Truck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

type DateMode = 'today' | 'yesterday' | 'week' | 'custom';

export default function LivraisonPage() {
  const { livraisons } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF } = useSettingsStore();
  const [dateStart, setDateStart] = useState(today());
  const [dateEnd, setDateEnd] = useState<string | undefined>(undefined);
  const [dateMode, setDateMode] = useState<DateMode>('today');

  const handleDateChange = (start: string, end: string | undefined, mode: DateMode) => {
    setDateStart(start);
    setDateEnd(end);
    setDateMode(mode);
  };

  const filteredLivs = useMemo(() => {
    if (dateEnd) return livraisons.filter((l) => isInRange(l.date, dateStart, dateEnd));
    return livraisons.filter((l) => l.date === dateStart);
  }, [livraisons, dateStart, dateEnd]);

  const totalVente = filteredLivs.reduce((s, l) => s + l.vente, 0);
  const totalCA = filteredLivs.reduce((s, l) => s + l.montant_attendu, 0);

  const isCurrentDay = dateMode === 'today';
  const dateLabel = dateEnd
    ? `${formatDateFR(dateStart)} — ${formatDateFR(dateEnd)}`
    : formatDateFR(dateStart);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LivraisonForm />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border-l-4 border-l-livraison bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="size-4 text-livraison" />
              {isCurrentDay ? 'Ventes du jour' : 'Ventes (période)'}
            </div>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatNumber(totalVente)}</p>
            <p className="text-sm text-muted-foreground">{filteredLivs.length} livraison(s)</p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{isCurrentDay ? 'CA attendu du jour' : 'CA attendu (période)'}</p>
            <p className="mt-1 font-display text-xl font-bold tabular-nums text-livraison-dark">{formatMoney(totalCA)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">≈ {formatUSD(fcToUsd(totalCA, TAUX_USD_CDF))}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold">
            Livraisons — {dateLabel}
          </h3>
          <DateSelector
            value={dateStart}
            endValue={dateEnd}
            mode={dateMode}
            onChange={handleDateChange}
            accentClass="bg-livraison hover:bg-livraison-dark"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {dateEnd && <th className="px-4 py-3">Date</th>}
                <th className="px-4 py-3">Livreur</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 text-right">Sortie</th>
                <th className="px-4 py-3 text-right">Retour</th>
                <th className="px-4 py-3 text-right">Bonus</th>
                <th className="px-4 py-3 text-right">Vente</th>
                <th className="px-4 py-3 text-right">Cash</th>
                <th className="px-4 py-3 text-right">Crédit</th>
                <th className="px-4 py-3 text-right">Attendu</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredLivs.length === 0 ? (
                <tr><td colSpan={dateEnd ? 11 : 10} className="px-4 py-12 text-center text-muted-foreground">Aucune livraison pour cette période</td></tr>
              ) : (
                filteredLivs.map((l) => {
                  const coherent = l.total_vendu === l.montant_attendu;
                  return (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                      {dateEnd && <td className="px-4 py-3 text-muted-foreground">{formatDateFR(l.date)}</td>}
                      <td className="px-4 py-3 font-medium">{l.livreur_nom}</td>
                      <td className="px-4 py-3">{l.produit_nom}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{l.sortie}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{l.retour}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{l.bonus}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{l.vente}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(l.ventes_cash)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(l.ventes_credit)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatMoney(l.montant_attendu)}</td>
                      <td className="px-4 py-3">
                        {coherent ? (
                          <Badge variant="secondary" className="bg-production-light text-production-dark text-xs border-0">OK</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="size-3" />Écart</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredLivs.length > 0 && (
              <tfoot>
                <tr className={cn('bg-livraison-light/50 font-semibold')}>
                  <td className="px-4 py-3" colSpan={dateEnd ? 6 : 5}>Total</td>
                  <td className="px-4 py-3 text-right tabular-nums text-livraison-dark">{formatNumber(totalVente)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoney(filteredLivs.reduce((s, l) => s + l.ventes_cash, 0))}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoney(filteredLivs.reduce((s, l) => s + l.ventes_credit, 0))}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-livraison-dark">{formatMoney(totalCA)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
