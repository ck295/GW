import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { computeNetVerseDetails } from '@/lib/calculations';
import { today } from '@/lib/dates';
import { formatMoney, formatUSD, fcToUsd } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShieldCheck, AlertTriangle, CheckCircle2, CircleDollarSign } from 'lucide-react';

export function EncaissementConfirmation() {
  const { livraisons, finances, confirmFinanceBulk } = useDataStore();
  const { tauxUsdCdf: TAUX_USD_CDF } = useSettingsStore();
  const t = today();

  const { details, totalAttendu, totalConfirme, totalNonConfirme } = useMemo(
    () => computeNetVerseDetails(livraisons, finances, t),
    [livraisons, finances, t]
  );

  const [montantCompte, setMontantCompte] = useState('');
  const [showResult, setShowResult] = useState(false);

  const montantSaisi = Number(montantCompte) || 0;
  const ecart = montantSaisi - totalAttendu;
  const ecartPct = totalAttendu > 0 ? Math.round((Math.abs(ecart) / totalAttendu) * 100) : 0;

  const handleVerify = () => {
    if (!montantCompte || montantSaisi <= 0) {
      toast.error('Veuillez saisir le montant physiquement compté');
      return;
    }
    setShowResult(true);

    if (ecart === 0) {
      toast.success('Montant conforme — aucun écart détecté');
    } else {
      toast.warning(`Écart détecté : ${formatMoney(Math.abs(ecart))} (${ecart > 0 ? 'excédent' : 'manquant'})`);
    }
  };

  const handleConfirmAll = () => {
    const unconfirmed = details.filter((d) => !d.confirmed && d.finance_id);
    if (unconfirmed.length === 0) {
      toast.info('Tous les encaissements sont déjà confirmés');
      return;
    }
    const ids = unconfirmed.map((d) => d.finance_id!).filter(Boolean);
    confirmFinanceBulk(ids);
    toast.success(`${unconfirmed.length} encaissement(s) confirmé(s)`);
    setShowResult(false);
    setMontantCompte('');
  };

  if (details.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5 text-finance" />
            Contrôle Encaissements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune livraison avec versement aujourd'hui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="size-5 text-finance" />
          Contrôle Encaissements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary bar */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-finance-light/40 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-finance-dark">Attendu (net versé)</p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-finance-dark">{formatMoney(totalAttendu)}</p>
            <p className="text-[10px] text-finance-dark/60 tabular-nums">≈ {formatUSD(fcToUsd(totalAttendu, TAUX_USD_CDF))}</p>
          </div>
          <div className="rounded-lg bg-production-light/40 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-production-dark">Confirmé</p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-production-dark">{formatMoney(totalConfirme)}</p>
            <p className="text-[10px] text-production-dark/60 tabular-nums">≈ {formatUSD(fcToUsd(totalConfirme, TAUX_USD_CDF))}</p>
          </div>
          <div className="rounded-lg bg-livraison-light/40 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-livraison-dark">En attente</p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-livraison-dark">{formatMoney(totalNonConfirme)}</p>
            <p className="text-[10px] text-livraison-dark/60 tabular-nums">≈ {formatUSD(fcToUsd(totalNonConfirme, TAUX_USD_CDF))}</p>
          </div>
        </div>

        {/* Detail table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5">Livreur</th>
                <th className="px-3 py-2.5">Produit</th>
                <th className="px-3 py-2.5 text-right">Net versé</th>
                <th className="px-3 py-2.5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium">{d.livreur_nom}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.produit_nom}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{formatMoney(d.net_verse)}</td>
                  <td className="px-3 py-2.5 text-center">
                    {d.confirmed ? (
                      <Badge variant="secondary" className="gap-1 text-xs bg-production-light text-production-dark border-0">
                        <CheckCircle2 className="size-3" /> Confirmé
                      </Badge>
                    ) : (
                      <Badge className="gap-1 text-xs bg-livraison-light text-livraison-dark border-0">
                        <CircleDollarSign className="size-3" /> En attente
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Physical count verification */}
        <div className="rounded-lg border-2 border-dashed border-finance/30 bg-finance-light/10 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CircleDollarSign className="size-4 text-finance" />
            Vérification physique
          </p>
          <p className="text-xs text-muted-foreground">
            Saisissez le montant total physiquement compté pour le comparer au montant attendu de {formatMoney(totalAttendu)}.
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              value={montantCompte}
              onChange={(e) => { setMontantCompte(e.target.value); setShowResult(false); }}
              placeholder="Montant compté (FC)"
              className="flex-1"
            />
            <Button onClick={handleVerify} className="bg-finance hover:bg-finance-dark shrink-0">
              Vérifier
            </Button>
          </div>

          {showResult && (
            <div className={cn(
              'rounded-lg p-4 flex items-start gap-3 animate-fade-in',
              ecart === 0 ? 'bg-production-light/50 border border-production/30' :
              Math.abs(ecart) <= totalAttendu * 0.02 ? 'bg-livraison-light/50 border border-livraison/30' :
              'bg-destructive/10 border border-destructive/30'
            )}>
              {ecart === 0 ? (
                <CheckCircle2 className="size-5 text-production shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className={cn('size-5 shrink-0 mt-0.5', Math.abs(ecart) <= totalAttendu * 0.02 ? 'text-livraison' : 'text-destructive')} />
              )}
              <div className="space-y-1">
                <p className={cn('text-sm font-semibold', ecart === 0 ? 'text-production-dark' : Math.abs(ecart) <= totalAttendu * 0.02 ? 'text-livraison-dark' : 'text-destructive')}>
                  {ecart === 0 ? 'Montant conforme' : ecart > 0 ? 'Excédent détecté' : 'Manquant détecté'}
                </p>
                <div className="text-xs space-y-0.5 text-muted-foreground">
                  <p>Montant attendu : <span className="font-semibold text-foreground">{formatMoney(totalAttendu)}</span></p>
                  <p>Montant compté : <span className="font-semibold text-foreground">{formatMoney(montantSaisi)}</span></p>
                  {ecart !== 0 && (
                    <p className={cn('font-semibold', ecart > 0 ? 'text-production-dark' : 'text-destructive')}>
                      Écart : {ecart > 0 ? '+' : ''}{formatMoney(ecart)} ({ecartPct}%)
                    </p>
                  )}
                </div>
                {ecart === 0 && totalNonConfirme > 0 && (
                  <Button size="sm" onClick={handleConfirmAll} className="mt-2 bg-production hover:bg-production-dark text-xs h-8">
                    <CheckCircle2 className="mr-1 size-3.5" />
                    Confirmer tous les encaissements
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
