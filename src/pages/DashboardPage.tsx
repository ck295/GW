import { useMemo, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useAlerts } from '@/hooks/useAlerts';
import { computeStockActuel, computeSoldeInitial, computeSoldeFinal, computeTodayEncaissements, computeTodayDepenses, computeProductionByDate, computeLivraisonByDate, getStockLevel } from '@/lib/calculations';
import type { StockLevel } from '@/lib/calculations';
import { today, yesterday, formatDateFR } from '@/lib/dates';
import { formatMoney, formatNumber, formatUSD, fcToUsd } from '@/lib/utils';
import { BASE_SOLDE } from '@/constants/config';
import { useSettingsStore } from '@/stores/settingsStore';
import { StatCard } from '@/components/features/StatCard';
import { ComparisonChart } from '@/components/features/ComparisonChart';
import { AlertPanel } from '@/components/features/AlertPanel';
import { DashboardDateSelector } from '@/components/features/DashboardDateSelector';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Factory, Package, Truck, Wallet, ArrowRight, DollarSign, BarChart3, Users, UserCheck, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const { products, productions, stockMouvements, livraisons, finances } = useDataStore();
  const alerts = useAlerts();
  const { tauxUsdCdf: TAUX_USD_CDF, tauxDate: TAUX_DATE } = useSettingsStore();

  const [dateA, setDateA] = useState(today());
  const [dateB, setDateB] = useState(yesterday());
  const t = dateA;
  const y = dateB;

  const dateALabel = dateA === today() ? "Aujourd'hui" : formatDateFR(dateA);
  const dateBLabel = dateB === yesterday() && dateA === today() ? 'Hier' : formatDateFR(dateB);

  const stats = useMemo(() => {
    const prodToday = productions.filter((p) => p.date === t).reduce((s, p) => s + p.quantite, 0);
    const prodYesterday = productions.filter((p) => p.date === y).reduce((s, p) => s + p.quantite, 0);
    const prodTrend = prodYesterday > 0 ? Math.round(((prodToday - prodYesterday) / prodYesterday) * 100) : 0;

    const stock = computeStockActuel(products, stockMouvements);
    const totalStock = stock.reduce((s, item) => s + item.quantite, 0);
    const lowStock = stock.filter((s) => {
      const product = products.find((p) => p.nom === s.produit_nom);
      const seuil = product?.seuil_bas ?? 50;
      return s.quantite <= seuil;
    }).length;

    const livToday = livraisons.filter((l) => l.date === t).reduce((s, l) => s + l.vente, 0);
    const livYesterday = livraisons.filter((l) => l.date === y).reduce((s, l) => s + l.vente, 0);
    const livTrend = livYesterday > 0 ? Math.round(((livToday - livYesterday) / livYesterday) * 100) : 0;

    const soldeFinal = computeSoldeFinal(finances, t, BASE_SOLDE);
    const soldeInitial = computeSoldeInitial(finances, t, BASE_SOLDE);
    const finTrend = soldeInitial > 0 ? Math.round(((soldeFinal - soldeInitial) / soldeInitial) * 100) : 0;

    return { prodToday, prodTrend, totalStock, lowStock, livToday, livTrend, soldeFinal, finTrend };
  }, [products, productions, stockMouvements, livraisons, finances, t, y, BASE_SOLDE]);

  const prodChartData = useMemo(() => {
    const todayMap = computeProductionByDate(productions, t);
    const yesterdayMap = computeProductionByDate(productions, y);
    const allProducts = [...new Set([...Object.keys(todayMap), ...Object.keys(yesterdayMap)])];
    return allProducts.map((name) => ({
      name: name.length > 12 ? name.substring(0, 12) + '…' : name,
      aujourd_hui: todayMap[name] || 0,
      hier: yesterdayMap[name] || 0,
    }));
  }, [productions, t, y]);

  const livChartData = useMemo(() => {
    const todayMap = computeLivraisonByDate(livraisons, t);
    const yesterdayMap = computeLivraisonByDate(livraisons, y);
    const allProducts = [...new Set([...Object.keys(todayMap), ...Object.keys(yesterdayMap)])];
    return allProducts.map((name) => ({
      name: name.length > 12 ? name.substring(0, 12) + '…' : name,
      aujourd_hui: todayMap[name] || 0,
      hier: yesterdayMap[name] || 0,
    }));
  }, [livraisons, t, y]);

  const financeData = useMemo(() => {
    const encToday = computeTodayEncaissements(finances, t);
    const depToday = computeTodayDepenses(finances, t);
    const encYesterday = computeTodayEncaissements(finances, y);
    const depYesterday = computeTodayDepenses(finances, y);
    return { encToday, depToday, encYesterday, depYesterday };
  }, [finances, t, y]);

  const soldeInitialToday = computeSoldeInitial(finances, t, BASE_SOLDE);
  const soldeFinalToday = stats.soldeFinal;
  const soldeInitialYesterday = computeSoldeInitial(finances, y, BASE_SOLDE);
  const soldeFinalYesterday = computeSoldeFinal(finances, y, BASE_SOLDE);

  // Per-product summary: production, sales, stock
  const productSummary = useMemo(() => {
    const prodMap = computeProductionByDate(productions, t);
    const salesMap = computeLivraisonByDate(livraisons, t);
    const stockList = computeStockActuel(products, stockMouvements);
    return products.map((p) => {
      const stk = stockList.find((s) => s.produit_nom === p.nom);
      const qty = stk?.quantite ?? 0;
      const level = getStockLevel(qty, p.seuil_bas, p.seuil_critique);
      return {
        nom: p.nom,
        production: prodMap[p.nom] || 0,
        ventes: salesMap[p.nom] || 0,
        stock: qty,
        level,
        prix: p.prix,
      };
    });
  }, [products, productions, livraisons, stockMouvements, t]);

  // Production by team
  const prodByTeam = useMemo(() => {
    const todayProds = productions.filter((p) => p.date === t);
    const teamMap: Record<string, { total: number; details: { produit: string; quantite: number }[] }> = {};
    todayProds.forEach((p) => {
      if (!teamMap[p.equipe_nom]) teamMap[p.equipe_nom] = { total: 0, details: [] };
      teamMap[p.equipe_nom].total += p.quantite;
      const existing = teamMap[p.equipe_nom].details.find((d) => d.produit === p.produit_nom);
      if (existing) existing.quantite += p.quantite;
      else teamMap[p.equipe_nom].details.push({ produit: p.produit_nom, quantite: p.quantite });
    });
    return Object.entries(teamMap).map(([nom, data]) => ({ nom, ...data })).sort((a, b) => b.total - a.total);
  }, [productions, t]);

  // Sales by livreur
  const salesByLivreur = useMemo(() => {
    const todayLivs = livraisons.filter((l) => l.date === t);
    const livreurMap: Record<string, { totalVente: number; totalCA: number; details: { produit: string; vente: number; ca: number }[] }> = {};
    todayLivs.forEach((l) => {
      if (!livreurMap[l.livreur_nom]) livreurMap[l.livreur_nom] = { totalVente: 0, totalCA: 0, details: [] };
      livreurMap[l.livreur_nom].totalVente += l.vente;
      livreurMap[l.livreur_nom].totalCA += l.montant_attendu;
      const existing = livreurMap[l.livreur_nom].details.find((d) => d.produit === l.produit_nom);
      if (existing) { existing.vente += l.vente; existing.ca += l.montant_attendu; }
      else livreurMap[l.livreur_nom].details.push({ produit: l.produit_nom, vente: l.vente, ca: l.montant_attendu });
    });
    return Object.entries(livreurMap).map(([nom, data]) => ({ nom, ...data })).sort((a, b) => b.totalCA - a.totalCA);
  }, [livraisons, t]);

  const LEVEL_CFG: Record<StockLevel, { label: string; cls: string; icon: typeof ShieldCheck }> = {
    normal: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShieldCheck },
    bas: { label: 'Bas', cls: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle },
    critique: { label: 'Critique', cls: 'bg-red-100 text-red-800 border-red-200', icon: ShieldAlert },
    negatif: { label: 'Négatif', cls: 'bg-red-200 text-red-900 border-red-300', icon: ShieldAlert },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date comparison selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Tableau de bord</h2>
          <p className="text-xs text-muted-foreground">
            Comparaison : <strong className="text-foreground">{dateALabel}</strong> vs <strong className="text-foreground">{dateBLabel}</strong>
          </p>
        </div>
        <DashboardDateSelector dateA={dateA} dateB={dateB} onChange={(a, b) => { setDateA(a); setDateB(b); }} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Production aujourd'hui" value={formatNumber(stats.prodToday)} subtitle="unités produites" icon={Factory} color="production" trend={{ value: stats.prodTrend, label: 'vs hier' }} />
        <StatCard title="Stock total" value={formatNumber(stats.totalStock)} subtitle={stats.lowStock > 0 ? `${stats.lowStock} produit(s) en stock bas` : 'Niveaux normaux'} icon={Package} color="stock" />
        <StatCard title="Ventes aujourd'hui" value={formatNumber(stats.livToday)} subtitle="unités livrées" icon={Truck} color="livraison" trend={{ value: stats.livTrend, label: 'vs hier' }} />
        <StatCard title="Solde actuel" value={formatMoney(stats.soldeFinal)} subtitle={`≈ ${formatUSD(fcToUsd(stats.soldeFinal, TAUX_USD_CDF))}`} icon={Wallet} color="finance" trend={{ value: stats.finTrend, label: 'vs début' }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ComparisonChart title={`Production — ${dateALabel} vs ${dateBLabel}`} data={prodChartData} todayColor="hsl(160, 84%, 39%)" todayLabel={dateALabel} yesterdayLabel={dateBLabel} />
        <ComparisonChart title={`Livraisons (ventes) — ${dateALabel} vs ${dateBLabel}`} data={livChartData} todayColor="hsl(38, 92%, 50%)" todayLabel={dateALabel} yesterdayLabel={dateBLabel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold">Finances — Comparaison</h3>
            <span className="flex items-center gap-1 rounded-full bg-finance-light/50 px-2.5 py-1 text-[11px] font-medium text-finance-dark">
              <DollarSign className="size-3" />
              1 USD = {formatNumber(TAUX_USD_CDF)} FC <span className="text-muted-foreground">({TAUX_DATE})</span>
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: dateALabel, initial: soldeInitialToday, enc: financeData.encToday, dep: financeData.depToday, final: soldeFinalToday },
              { label: dateBLabel, initial: soldeInitialYesterday, enc: financeData.encYesterday, dep: financeData.depYesterday, final: soldeFinalYesterday },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">{row.label}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded bg-muted px-2 py-1 tabular-nums">{formatMoney(row.initial)}</span>
                  <span className="text-production">+ {formatMoney(row.enc)}</span>
                  <span className="text-destructive">− {formatMoney(row.dep)}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span className="rounded bg-finance-light px-2 py-1 font-semibold text-finance-dark tabular-nums">
                    {formatMoney(row.final)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">≈ {formatUSD(fcToUsd(row.final, TAUX_USD_CDF))}</p>
              </div>
            ))}
          </div>
        </div>

        <AlertPanel alerts={alerts} />
      </div>

      {/* Per-product summary table */}
      <div className="rounded-xl bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <BarChart3 className="size-5 text-stock" />
            Synthèse par Produit — {dateALabel}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Production, ventes et stock disponible</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3 text-right">Production</th>
                <th className="px-5 py-3 text-right">Ventes</th>
                <th className="px-5 py-3 text-right">CA estimé</th>
                <th className="px-5 py-3 text-right">Stock dispo.</th>
                <th className="px-5 py-3 text-center">État</th>
              </tr>
            </thead>
            <tbody>
              {productSummary.map((p) => {
                const cfg = LEVEL_CFG[p.level];
                const Icon = cfg.icon;
                return (
                  <tr key={p.nom} className={cn('border-b last:border-0 hover:bg-muted/30', (p.level === 'critique' || p.level === 'negatif') && 'bg-red-50/50')}>
                    <td className="px-5 py-3 font-medium">{p.nom}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className={cn('font-semibold', p.production > 0 ? 'text-production' : 'text-muted-foreground')}>{formatNumber(p.production)}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className={cn('font-semibold', p.ventes > 0 ? 'text-livraison' : 'text-muted-foreground')}>{formatNumber(p.ventes)}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-xs">
                      <span className="font-medium">{formatMoney(p.ventes * p.prix)}</span>
                      <span className="block text-[10px] text-muted-foreground">≈ {formatUSD(fcToUsd(p.ventes * p.prix, TAUX_USD_CDF))}</span>
                    </td>
                    <td className={cn('px-5 py-3 text-right tabular-nums text-lg font-bold', p.level === 'normal' ? 'text-emerald-600' : p.level === 'bas' ? 'text-amber-600' : 'text-red-600')}>
                      {formatNumber(p.stock)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant="outline" className={cn('gap-1 text-xs border', cfg.cls)}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {productSummary.length > 0 && (
                <tr className="bg-muted/30 font-semibold">
                  <td className="px-5 py-3">TOTAL</td>
                  <td className="px-5 py-3 text-right tabular-nums text-production">{formatNumber(productSummary.reduce((s, p) => s + p.production, 0))}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-livraison">{formatNumber(productSummary.reduce((s, p) => s + p.ventes, 0))}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-xs">
                    {formatMoney(productSummary.reduce((s, p) => s + p.ventes * p.prix, 0))}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatNumber(productSummary.reduce((s, p) => s + p.stock, 0))}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production by team + Sales by livreur */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production by team */}
        <div className="rounded-xl bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Users className="size-5 text-production" />
              Production par Équipe — {dateALabel}
            </h3>
          </div>
          <div className="divide-y">
            {prodByTeam.length === 0 && (
              <p className="px-5 py-8 text-center text-muted-foreground text-sm">Aucune production enregistrée aujourd'hui</p>
            )}
            {prodByTeam.map((team) => (
              <div key={team.nom} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-production/10">
                      <Factory className="size-4 text-production" />
                    </span>
                    <span className="font-semibold text-sm">{team.nom}</span>
                  </div>
                  <span className="font-display text-lg font-bold text-production tabular-nums">{formatNumber(team.total)}</span>
                </div>
                <div className="ml-10 flex flex-wrap gap-2">
                  {team.details.sort((a, b) => b.quantite - a.quantite).map((d) => (
                    <span key={d.produit} className="inline-flex items-center gap-1.5 rounded-full bg-production/5 border border-production/10 px-2.5 py-1 text-xs">
                      <span className="font-medium text-foreground">{d.produit}</span>
                      <span className="font-bold text-production tabular-nums">{formatNumber(d.quantite)}</span>
                    </span>
                  ))}
                </div>
                {/* Progress bar relative to total production */}
                <div className="ml-10 mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-production transition-all"
                    style={{ width: `${Math.min(100, (team.total / Math.max(1, prodByTeam[0]?.total)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by livreur */}
        <div className="rounded-xl bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <UserCheck className="size-5 text-livraison" />
              Ventes par Livreur — {dateALabel}
            </h3>
          </div>
          <div className="divide-y">
            {salesByLivreur.length === 0 && (
              <p className="px-5 py-8 text-center text-muted-foreground text-sm">Aucune vente enregistrée aujourd'hui</p>
            )}
            {salesByLivreur.map((lv) => (
              <div key={lv.nom} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-livraison/10">
                      <Truck className="size-4 text-livraison" />
                    </span>
                    <div>
                      <span className="font-semibold text-sm block">{lv.nom}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{formatMoney(lv.totalCA)} · ≈ {formatUSD(fcToUsd(lv.totalCA, TAUX_USD_CDF))}</span>
                    </div>
                  </div>
                  <span className="font-display text-lg font-bold text-livraison tabular-nums">{formatNumber(lv.totalVente)} <span className="text-xs font-normal text-muted-foreground">unités</span></span>
                </div>
                <div className="ml-10 flex flex-wrap gap-2">
                  {lv.details.sort((a, b) => b.ca - a.ca).map((d) => (
                    <span key={d.produit} className="inline-flex items-center gap-1.5 rounded-full bg-livraison/5 border border-livraison/10 px-2.5 py-1 text-xs">
                      <span className="font-medium text-foreground">{d.produit}</span>
                      <span className="font-bold text-livraison tabular-nums">{formatNumber(d.vente)}</span>
                      <span className="text-muted-foreground tabular-nums">({formatMoney(d.ca)})</span>
                    </span>
                  ))}
                </div>
                {/* Progress bar relative to top livreur */}
                <div className="ml-10 mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-livraison transition-all"
                    style={{ width: `${Math.min(100, (lv.totalCA / Math.max(1, salesByLivreur[0]?.totalCA)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
