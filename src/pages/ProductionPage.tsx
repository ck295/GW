import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductionForm } from '@/components/features/ProductionForm';
import { DateSelector } from '@/components/features/DateSelector';
import { today, yesterday, formatDateFR, isInRange } from '@/lib/dates';
import { formatNumber } from '@/lib/utils';
import { Factory, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DateMode = 'today' | 'yesterday' | 'week' | 'custom';

export default function ProductionPage() {
  const { productions } = useDataStore();
  const [dateStart, setDateStart] = useState(today());
  const [dateEnd, setDateEnd] = useState<string | undefined>(undefined);
  const [dateMode, setDateMode] = useState<DateMode>('today');

  const handleDateChange = (start: string, end: string | undefined, mode: DateMode) => {
    setDateStart(start);
    setDateEnd(end);
    setDateMode(mode);
  };

  const filteredProds = useMemo(() => {
    if (dateEnd) return productions.filter((p) => isInRange(p.date, dateStart, dateEnd));
    return productions.filter((p) => p.date === dateStart);
  }, [productions, dateStart, dateEnd]);

  const filteredTotal = filteredProds.reduce((s, p) => s + p.quantite, 0);

  const y = yesterday();
  const yesterdayTotal = useMemo(
    () => productions.filter((p) => p.date === y).reduce((s, p) => s + p.quantite, 0),
    [productions, y]
  );

  const isCurrentDay = dateMode === 'today';
  const dateLabel = dateEnd
    ? `${formatDateFR(dateStart)} — ${formatDateFR(dateEnd)}`
    : formatDateFR(dateStart);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductionForm />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border-l-4 border-l-production bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Factory className="size-4 text-production" />
              {isCurrentDay ? 'Production du jour' : 'Production (période)'}
            </div>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatNumber(filteredTotal)}</p>
            <p className="text-sm text-muted-foreground">{filteredProds.length} entrée(s)</p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              Hier
            </div>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-muted-foreground">{formatNumber(yesterdayTotal)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold">
            Entrées — {dateLabel}
          </h3>
          <DateSelector
            value={dateStart}
            endValue={dateEnd}
            mode={dateMode}
            onChange={handleDateChange}
            accentClass="bg-production hover:bg-production-dark"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {dateEnd && <th className="px-5 py-3">Date</th>}
                <th className="px-5 py-3">Équipe</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3 text-right">Quantité</th>
                <th className="px-5 py-3">Opérateur</th>
              </tr>
            </thead>
            <tbody>
              {filteredProds.length === 0 ? (
                <tr><td colSpan={dateEnd ? 5 : 4} className="px-5 py-12 text-center text-muted-foreground">Aucune production pour cette période</td></tr>
              ) : (
                filteredProds.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    {dateEnd && <td className="px-5 py-3 text-muted-foreground">{formatDateFR(p.date)}</td>}
                    <td className="px-5 py-3">{p.equipe_nom}</td>
                    <td className="px-5 py-3 font-medium">{p.produit_nom}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{formatNumber(p.quantite)}</td>
                    <td className="px-5 py-3"><Badge variant="secondary" className="text-xs">{p.user_email}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredProds.length > 0 && (
              <tfoot>
                <tr className="bg-production-light/50 font-semibold">
                  <td className="px-5 py-3" colSpan={dateEnd ? 3 : 2}>Total</td>
                  <td className="px-5 py-3 text-right tabular-nums text-production-dark">{formatNumber(filteredTotal)}</td>
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
