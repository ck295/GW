import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import { Settings, DollarSign, History, RefreshCw, CheckCircle2, ArrowRight, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export default function SettingsPage() {
  const { tauxUsdCdf, tauxDate, tauxSource, tauxHistory, updateTaux } = useSettingsStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [newTaux, setNewTaux] = useState('');
  const [newSource, setNewSource] = useState('BCC (Banque Centrale du Congo)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingBCC, setIsFetchingBCC] = useState(false);
  const [bccFetchDate, setBccFetchDate] = useState<string | null>(null);

  const handleFetchBCC = async () => {
    setIsFetchingBCC(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-bcc-rate');
      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const textContent = await error.context?.text();
            const parsed = textContent ? JSON.parse(textContent) : null;
            errorMessage = parsed?.error || parsed?.hint || textContent || error.message;
          } catch {
            errorMessage = error.message || 'Erreur inconnue';
          }
        }
        toast.error(errorMessage);
        return;
      }
      if (data?.taux) {
        setNewTaux(String(data.taux));
        setNewSource('BCC (Banque Centrale du Congo) — cours indicatif');
        setBccFetchDate(data.date || null);
        toast.success(`Taux BCC récupéré : 1 USD = ${formatNumber(data.taux)} FC (${data.date})`);
      } else {
        toast.error('Aucun taux trouvé dans la réponse');
      }
    } catch (err: any) {
      console.error('Fetch BCC error:', err);
      toast.error('Impossible de contacter le serveur');
    } finally {
      setIsFetchingBCC(false);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const taux = parseFloat(newTaux);
    if (!taux || taux <= 0) {
      toast.error('Veuillez saisir un taux valide supérieur à 0');
      return;
    }
    if (!newSource.trim()) {
      toast.error('Veuillez indiquer la source du taux');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      updateTaux(taux, newSource.trim(), currentUser?.nom ?? 'Admin');
      toast.success(`Taux mis à jour : 1 USD = ${formatNumber(taux)} FC`);
      setNewTaux('');
      setIsSubmitting(false);
    }, 300);
  };

  const variation = tauxHistory.length >= 2
    ? ((tauxHistory[0].taux - tauxHistory[1].taux) / tauxHistory[1].taux) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10">
          <Settings className="size-5 text-teal-500" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Paramètres</h2>
          <p className="text-sm text-muted-foreground">Configuration du taux de change et préférences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current rate display */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="size-5 text-finance" />
                Taux de Change Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-gradient-to-br from-navy to-[hsl(210,60%,18%)] p-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">1 Dollar américain (USD)</p>
                    <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight">
                      {formatNumber(tauxUsdCdf)} <span className="text-xl font-normal text-teal-400">FC</span>
                    </p>
                    {variation !== 0 && (
                      <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${variation > 0 ? 'text-red-400' : 'text-production'}`}>
                        {variation > 0 ? '↑' : '↓'} {Math.abs(variation).toFixed(2)}% vs taux précédent
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-400">Dernière mise à jour</p>
                    <p className="font-semibold text-white">{tauxDate}</p>
                    <p className="text-slate-400">{tauxSource}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                  {[
                    { label: '100 USD', value: 100 * tauxUsdCdf },
                    { label: '500 USD', value: 500 * tauxUsdCdf },
                    { label: '1 000 USD', value: 1000 * tauxUsdCdf },
                  ].map((conv) => (
                    <div key={conv.label} className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-xs text-slate-400">{conv.label}</p>
                      <p className="mt-0.5 font-display text-sm font-bold tabular-nums">{formatNumber(Math.round(conv.value))} FC</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="size-5 text-muted-foreground" />
                Historique des Taux
                <Badge variant="secondary" className="text-xs ml-1">{tauxHistory.length} entrée(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-right">Taux (1 USD)</th>
                      <th className="px-5 py-3">Variation</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Mis à jour par</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tauxHistory.map((entry, idx) => {
                      const prev = tauxHistory[idx + 1];
                      const change = prev ? ((entry.taux - prev.taux) / prev.taux) * 100 : 0;
                      const isLatest = idx === 0;
                      return (
                        <tr key={entry.id} className={`border-b last:border-0 hover:bg-muted/30 ${isLatest ? 'bg-finance-light/20' : ''}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {isLatest && <span className="flex size-2 rounded-full bg-finance animate-pulse" />}
                              <span className={isLatest ? 'font-semibold' : ''}>{entry.date}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums">
                            <span className={isLatest ? 'font-bold text-lg' : 'font-medium'}>
                              {formatNumber(entry.taux)} FC
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {change !== 0 ? (
                              <Badge className={`text-xs border-0 ${change > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {change > 0 ? '+' : ''}{change.toFixed(2)}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate">{entry.source}</td>
                          <td className="px-5 py-3">
                            <Badge variant="secondary" className="text-xs">{entry.updatedBy}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update form */}
        <div>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="size-5 text-teal-500" />
                Mettre à jour le taux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3 mb-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Taux actuel</p>
                  <p className="font-display text-lg font-bold tabular-nums">1 USD = {formatNumber(tauxUsdCdf)} FC</p>
                </div>

                {/* Fetch from BCC button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchBCC}
                  disabled={isFetchingBCC}
                  className="w-full gap-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
                >
                  {isFetchingBCC ? (
                    <><Loader2 className="size-4 animate-spin" />Récupération en cours…</>
                  ) : (
                    <><Globe className="size-4" />Récupérer le taux BCC du jour</>
                  )}
                </Button>
                {bccFetchDate && (
                  <p className="text-[11px] text-teal-600 -mt-2 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Taux du {bccFetchDate} pré-rempli ci-dessous
                  </p>
                )}

                <div className="space-y-2">
                  <Label>Nouveau taux (FC pour 1 USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0.01"
                      step="0.0001"
                      value={newTaux}
                      onChange={(e) => { setNewTaux(e.target.value); setBccFetchDate(null); }}
                      placeholder="Ex: 2860.50"
                      className="pl-9"
                    />
                  </div>
                </div>

                {newTaux && Number(newTaux) > 0 && (
                  <div className="rounded-lg border border-dashed border-finance/40 bg-finance-light/20 p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Aperçu</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="tabular-nums">{formatNumber(tauxUsdCdf)} FC</span>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                      <span className="font-bold tabular-nums text-finance-dark">{formatNumber(Number(newTaux))} FC</span>
                    </div>
                    {(() => {
                      const diff = ((Number(newTaux) - tauxUsdCdf) / tauxUsdCdf) * 100;
                      return diff !== 0 ? (
                        <p className={`text-xs font-medium ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(2)}%
                        </p>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Source</Label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="BCC (Banque Centrale du Congo)">BCC (Banque Centrale du Congo)</option>
                    <option value="Marché parallèle">Marché parallèle</option>
                    <option value="Bureau de change">Bureau de change</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                  <CheckCircle2 className="mr-2 size-4" />
                  {isSubmitting ? 'Mise à jour...' : 'Appliquer le nouveau taux'}
                </Button>
              </form>

              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Le taux sera appliqué immédiatement sur toutes les conversions FC → USD dans l'application. Consultez le site{' '}
                  <a href="https://www.bcc.cd/" target="_blank" rel="noopener noreferrer" className="font-medium text-finance underline underline-offset-2 hover:text-finance-dark">
                    bcc.cd
                  </a>{' '}
                  pour le cours indicatif officiel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
