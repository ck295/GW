import { useMemo, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { computeStockActuel, getStockLevel, computeStockEvolution } from '@/lib/calculations';
import type { StockLevel } from '@/lib/calculations';
import { formatNumber } from '@/lib/utils';
import { formatDateFR } from '@/lib/dates';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const LEVEL_CONFIG: Record<StockLevel, { label: string; badge: string; text: string; icon: typeof ShieldCheck; dotClass: string }> = {
  normal: { label: 'Normal', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600', icon: ShieldCheck, dotClass: 'bg-emerald-500' },
  bas: { label: 'Bas', badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-600', icon: AlertTriangle, dotClass: 'bg-amber-500' },
  critique: { label: 'Critique', badge: 'bg-red-100 text-red-800 border-red-200', text: 'text-red-600', icon: ShieldAlert, dotClass: 'bg-red-500' },
  negatif: { label: 'Négatif', badge: 'bg-red-200 text-red-900 border-red-300', text: 'text-red-700', icon: ShieldAlert, dotClass: 'bg-red-700' },
};

export default function StockPage() {
  const { products, stockMouvements } = useDataStore();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const stockActuel = useMemo(() => computeStockActuel(products, stockMouvements), [products, stockMouvements]);
  const recentMouvements = useMemo(
    () => [...stockMouvements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25),
    [stockMouvements]
  );

  const totalStock = stockActuel.reduce((s, i) => s + i.quantite, 0);

  const stockWithLevels = useMemo(() =>
    stockActuel.map((s) => {
      const product = products.find((p) => p.nom === s.produit_nom);
      const seuil_bas = product?.seuil_bas ?? 50;
      const seuil_critique = product?.seuil_critique ?? 20;
      const level = getStockLevel(s.quantite, seuil_bas, seuil_critique);
      return { ...s, level, seuil_bas, seuil_critique };
    }).sort((a, b) => {
      const order: Record<StockLevel, number> = { negatif: 0, critique: 1, bas: 2, normal: 3 };
      return order[a.level] - order[b.level];
    }),
  [stockActuel, products]);

  const criticalCount = stockWithLevels.filter((s) => s.level === 'critique' || s.level === 'negatif').length;
  const lowCount = stockWithLevels.filter((s) => s.level === 'bas').length;
  const normalCount = stockWithLevels.filter((s) => s.level === 'normal').length;

  const evolutionData = useMemo(() => {
    if (!expandedProduct) return [];
    return computeStockEvolution(expandedProduct, stockMouvements, 7);
  }, [expandedProduct, stockMouvements]);

  const expandedMeta = expandedProduct ? stockWithLevels.find((s) => s.produit_nom === expandedProduct) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-l-4 border-l-stock bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4 text-stock" />Stock total
          </div>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatNumber(totalStock)}</p>
          <p className="text-sm text-muted-foreground">{products.length} produits</p>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <ShieldCheck className="size-4" /> Normal
          </div>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-600">{normalCount}</p>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="size-4" /> Bas
          </div>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-amber-600">{lowCount}</p>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <ShieldAlert className="size-4" /> Critique
          </div>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-red-600">{criticalCount}</p>
        </div>
      </div>

      {/* Stock evolution chart */}
      {expandedProduct && evolutionData.length > 0 && expandedMeta && (
        <div className="rounded-xl bg-card p-5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <TrendingUp className="size-5 text-stock" />
              Évolution du stock — {expandedProduct}
              <span className="text-xs text-muted-foreground font-normal">(7 derniers jours)</span>
            </h3>
            <button onClick={() => setExpandedProduct(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Fermer
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(187, 70%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(187, 70%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 80%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v: string) => formatDateFR(v)}
                  formatter={(value: number) => [formatNumber(value), 'Stock']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <ReferenceLine y={expandedMeta.seuil_bas} stroke="hsl(38, 92%, 50%)" strokeDasharray="5 5" label={{ value: `Seuil bas (${expandedMeta.seuil_bas})`, position: 'right', fontSize: 10, fill: 'hsl(38, 92%, 50%)' }} />
                <ReferenceLine y={expandedMeta.seuil_critique} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" label={{ value: `Critique (${expandedMeta.seuil_critique})`, position: 'right', fontSize: 10, fill: 'hsl(0, 72%, 51%)' }} />
                <Area type="monotone" dataKey="quantite" stroke="hsl(187, 70%, 48%)" fill="url(#stockGradient)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(187, 70%, 48%)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-amber-500" /> Seuil bas : {expandedMeta.seuil_bas}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-red-500" /> Seuil critique : {expandedMeta.seuil_critique}</span>
          </div>
        </div>
      )}

      {/* Stock table */}
      <div className="rounded-xl bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Package className="size-5 text-stock" />
            Stock Actuel par Produit
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cliquez sur un produit pour voir l'évolution 7 jours</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3 text-right">Entrées</th>
                <th className="px-5 py-3 text-right">Sorties</th>
                <th className="px-5 py-3 text-right">Déclass.</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-center">Seuils</th>
                <th className="px-5 py-3">État</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {stockWithLevels.map((s) => {
                const cfg = LEVEL_CONFIG[s.level];
                const Icon = cfg.icon;
                const isExpanded = expandedProduct === s.produit_nom;
                return (
                  <tr
                    key={s.produit_nom}
                    onClick={() => setExpandedProduct(isExpanded ? null : s.produit_nom)}
                    className={cn(
                      'border-b last:border-0 cursor-pointer transition-colors',
                      isExpanded ? 'bg-stock/5' : 'hover:bg-muted/30',
                      (s.level === 'critique' || s.level === 'negatif') && 'bg-red-50/50'
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2 rounded-full shrink-0', cfg.dotClass)} />
                        <span className="font-medium">{s.produit_nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-production">{formatNumber(s.entrees)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-destructive">{formatNumber(s.sorties)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatNumber(s.declassements)}</td>
                    <td className={cn('px-5 py-3 text-right tabular-nums font-bold text-lg', cfg.text)}>
                      {formatNumber(s.quantite)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 tabular-nums">{s.seuil_bas}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 tabular-nums">{s.seuil_critique}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={cn('gap-1 text-xs border', cfg.badge)}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent movements */}
      <div className="rounded-xl bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold">Derniers Mouvements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Quantité</th>
                <th className="px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentMouvements.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3 text-muted-foreground">{formatDateFR(m.date)}</td>
                  <td className="px-5 py-3 font-medium">{m.produit_nom}</td>
                  <td className="px-5 py-3">
                    <Badge variant={m.type === 'entree' ? 'default' : 'destructive'} className={cn('text-xs', m.type === 'entree' ? 'bg-production text-white' : m.type === 'declassement' ? 'bg-muted-foreground' : '')}>
                      {m.type === 'entree' ? '↑ Entrée' : m.type === 'sortie' ? '↓ Sortie' : '⊘ Décl.'}
                    </Badge>
                  </td>
                  <td className={cn('px-5 py-3 text-right tabular-nums font-semibold', m.type === 'entree' ? 'text-production' : 'text-destructive')}>
                    {m.type === 'entree' ? '+' : '−'}{formatNumber(m.quantite)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">{m.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
