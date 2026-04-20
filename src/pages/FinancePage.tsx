import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { FinanceForm } from '@/components/features/FinanceForm';
import { EncaissementConfirmation } from '@/components/features/EncaissementConfirmation';
import { DateSelector } from '@/components/features/DateSelector';
import { computeSoldeInitial, computeSoldeFinal, computeTodayEncaissements, computeTodayDepenses } from '@/lib/calculations';
import { today, formatDateFR, isInRange } from '@/lib/dates';
import { formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { BASE_SOLDE } from '@/constants/config';
import { useSettingsStore } from '@/stores/settingsStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet, ArrowDown, ArrowUp, ArrowRight, DollarSign, CheckCircle2, Filter, CheckCheck, Clock } from 'lucide-react';

type DateMode = 'today' | 'yesterday' | 'week' | 'custom';
type StatusFilter = 'all' | 'pending' | 'confirmed';

function formatConfirmedAt(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function FinancePage() {
  const { finances, confirmFinance, confirmFinanceBulk } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF, tauxDate: TAUX_DATE } = useSettingsStore();
  const [dateStart, setDateStart] = useState(today());
  const [dateEnd, setDateEnd] = useState<string | undefined>(undefined);
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const handleDateChange = (start: string, end: string | undefined, mode: DateMode) => {
    setDateStart(start);
    setDateEnd(end);
    setDateMode(mode);
  };

  const isCurrentDay = dateMode === 'today';

  // For single-day: use the selected date for finance computations
  // For range: compute aggregate across all days in range
  const soldeInitial = useMemo(() => computeSoldeInitial(finances, dateStart, BASE_SOLDE), [finances, dateStart]);
  const soldeFinal = useMemo(() => {
    const endDate = dateEnd || dateStart;
    // Compute final balance up to and including the end date
    let solde = computeSoldeInitial(finances, dateStart, BASE_SOLDE);
    finances
      .filter((f) => isInRange(f.date, dateStart, endDate))
      .forEach((f) => {
        solde += f.type === 'encaissement' ? f.montant : -f.montant;
      });
    return solde;
  }, [finances, dateStart, dateEnd]);

  const encaissements = useMemo(() => {
    if (dateEnd) {
      return finances
        .filter((f) => f.type === 'encaissement' && isInRange(f.date, dateStart, dateEnd))
        .reduce((s, f) => s + f.montant, 0);
    }
    return computeTodayEncaissements(finances, dateStart);
  }, [finances, dateStart, dateEnd]);

  const depenses = useMemo(() => {
    if (dateEnd) {
      return finances
        .filter((f) => f.type === 'depense' && isInRange(f.date, dateStart, dateEnd))
        .reduce((s, f) => s + f.montant, 0);
    }
    return computeTodayDepenses(finances, dateStart);
  }, [finances, dateStart, dateEnd]);

  const filteredEntries = useMemo(() => {
    let entries = dateEnd
      ? finances.filter((f) => isInRange(f.date, dateStart, dateEnd))
      : finances.filter((f) => f.date === dateStart);
    if (statusFilter === 'pending') entries = entries.filter((f) => f.type === 'encaissement' && !f.confirmed);
    else if (statusFilter === 'confirmed') entries = entries.filter((f) => f.confirmed);
    return entries.sort((a, b) => b.id.localeCompare(a.id));
  }, [finances, dateStart, dateEnd, statusFilter]);

  const pendingEntries = useMemo(() => {
    const entries = dateEnd
      ? finances.filter((f) => isInRange(f.date, dateStart, dateEnd))
      : finances.filter((f) => f.date === dateStart);
    return entries.filter((f) => f.type === 'encaissement' && !f.confirmed);
  }, [finances, dateStart, dateEnd]);

  const handleBulkConfirm = () => {
    if (pendingEntries.length === 0) {
      toast.info('Aucun encaissement en attente');
      return;
    }
    const ids = pendingEntries.map((f) => f.id);
    confirmFinanceBulk(ids);
    toast.success(`${ids.length} encaissement(s) confirmé(s)`);
  };

  const dateLabel = dateEnd
    ? `${formatDateFR(dateStart)} — ${formatDateFR(dateEnd)}`
    : formatDateFR(dateStart);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <Wallet className="size-5 text-finance" />
                Résumé financier — {dateLabel}
              </h3>
              <DateSelector
                value={dateStart}
                endValue={dateEnd}
                mode={dateMode}
                onChange={handleDateChange}
                accentClass="bg-finance hover:bg-finance-dark"
              />
            </div>
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <DollarSign className="size-3.5 text-finance" />
              Taux BCC : <strong className="text-foreground">1 USD = {new Intl.NumberFormat('fr-FR').format(TAUX_USD_CDF)} FC</strong>
              <span>({TAUX_DATE})</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Solde Initial</p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">{formatMoney(soldeInitial)}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">≈ {formatUSD(fcToUsd(soldeInitial, TAUX_USD_CDF))}</p>
              </div>
              <div className="rounded-lg border border-production/20 bg-production-light/30 p-4">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-production-dark">
                  <ArrowDown className="size-3" /> Encaissements
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums text-production-dark">+ {formatMoney(encaissements)}</p>
                <p className="text-[11px] text-production-dark/70 tabular-nums">≈ {formatUSD(fcToUsd(encaissements, TAUX_USD_CDF))}</p>
              </div>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-destructive">
                  <ArrowUp className="size-3" /> Dépenses
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums text-destructive">− {formatMoney(depenses)}</p>
                <p className="text-[11px] text-destructive/70 tabular-nums">≈ {formatUSD(fcToUsd(depenses, TAUX_USD_CDF))}</p>
              </div>
              <div className="rounded-lg border-2 border-finance/30 bg-finance-light/30 p-4">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-finance-dark">
                  <ArrowRight className="size-3" /> Solde Final
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums text-finance-dark">{formatMoney(soldeFinal)}</p>
                <p className="text-[11px] text-finance-dark/70 tabular-nums">≈ {formatUSD(fcToUsd(soldeFinal, TAUX_USD_CDF))}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card shadow-sm">
            <div className="border-b px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-base font-semibold">Opérations — {dateLabel}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status filter */}
                <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      statusFilter === 'all' ? 'bg-finance text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      statusFilter === 'pending' ? 'bg-livraison text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    En attente ({pendingEntries.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      statusFilter === 'confirmed' ? 'bg-production text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    Confirmés
                  </button>
                </div>
                {/* Bulk confirm */}
                {pendingEntries.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleBulkConfirm}
                    className="h-8 gap-1.5 text-xs bg-production hover:bg-production-dark"
                  >
                    <CheckCheck className="size-3.5" />
                    Confirmer tout ({pendingEntries.length})
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {dateEnd && <th className="px-5 py-3">Date</th>}
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Montant</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Confirmé le</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr><td colSpan={dateEnd ? 7 : 6} className="px-5 py-12 text-center text-muted-foreground">{statusFilter !== 'all' ? 'Aucune opération correspondant au filtre' : 'Aucune opération pour cette période'}</td></tr>
                  ) : (
                    filteredEntries.map((f) => (
                      <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30">
                        {dateEnd && <td className="px-5 py-3 text-muted-foreground">{formatDateFR(f.date)}</td>}
                        <td className="px-5 py-3">
                          <Badge className={f.type === 'encaissement' ? 'bg-production text-white text-xs border-0' : 'bg-destructive text-white text-xs border-0'}>
                            {f.type === 'encaissement' ? '↓ Encaissement' : '↑ Dépense'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 max-w-xs truncate">{f.description}</td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold">
                          <span className={f.type === 'encaissement' ? 'text-production' : 'text-destructive'}>
                            {f.type === 'encaissement' ? '+' : '−'} {formatMoney(f.montant)}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">≈ {formatUSD(fcToUsd(f.montant, TAUX_USD_CDF))}</span>
                        </td>
                        <td className="px-5 py-3">
                          {f.confirmed ? (
                            <Badge variant="secondary" className="text-xs gap-1 bg-production-light text-production-dark border-0">
                              <CheckCircle2 className="size-3" /> Confirmé
                            </Badge>
                          ) : f.type === 'encaissement' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 text-xs border-livraison/40 bg-livraison-light/50 text-livraison-dark hover:bg-livraison hover:text-white transition-colors"
                              onClick={() => {
                                confirmFinance(f.id);
                                toast.success(`Encaissement confirmé : ${formatMoney(f.montant)}`);
                              }}
                            >
                              <CheckCircle2 className="size-3" />
                              Confirmer
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">—</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                          {f.confirmedAt ? (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-production" />
                              {formatConfirmedAt(f.confirmedAt)}
                            </span>
                          ) : f.type === 'encaissement' ? (
                            <span className="text-livraison-dark/60">En attente</span>
                          ) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <EncaissementConfirmation />
          <FinanceForm />
        </div>
      </div>
    </div>
  );
}
