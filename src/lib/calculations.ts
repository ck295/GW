import type { Product, StockMouvement, FinanceEntry, Livraison } from '@/types';

export interface StockActuel {
  produit_nom: string;
  quantite: number;
  entrees: number;
  sorties: number;
  declassements: number;
}

export function computeStockActuel(
  products: Product[],
  mouvements: StockMouvement[]
): StockActuel[] {
  const map: Record<string, StockActuel> = {};

  products.forEach((p) => {
    map[p.nom] = { produit_nom: p.nom, quantite: 0, entrees: 0, sorties: 0, declassements: 0 };
  });

  mouvements.forEach((m) => {
    if (!map[m.produit_nom]) {
      map[m.produit_nom] = { produit_nom: m.produit_nom, quantite: 0, entrees: 0, sorties: 0, declassements: 0 };
    }
    const s = map[m.produit_nom];
    if (m.type === 'entree') {
      s.entrees += m.quantite;
      s.quantite += m.quantite;
    } else if (m.type === 'sortie') {
      s.sorties += m.quantite;
      s.quantite -= m.quantite;
    } else if (m.type === 'declassement') {
      s.declassements += m.quantite;
      s.quantite -= m.quantite;
    }
  });

  return Object.values(map);
}

export function computeSoldeInitial(finances: FinanceEntry[], date: string, baseSolde: number): number {
  let solde = baseSolde;
  finances
    .filter((f) => f.date < date)
    .forEach((f) => {
      solde += f.type === 'encaissement' ? f.montant : -f.montant;
    });
  return solde;
}

export function computeSoldeFinal(finances: FinanceEntry[], date: string, baseSolde: number): number {
  let solde = computeSoldeInitial(finances, date, baseSolde);
  finances
    .filter((f) => f.date === date)
    .forEach((f) => {
      solde += f.type === 'encaissement' ? f.montant : -f.montant;
    });
  return solde;
}

export function computeTodayEncaissements(finances: FinanceEntry[], date: string): number {
  return finances.filter((f) => f.date === date && f.type === 'encaissement').reduce((s, f) => s + f.montant, 0);
}

export function computeTodayDepenses(finances: FinanceEntry[], date: string): number {
  return finances.filter((f) => f.date === date && f.type === 'depense').reduce((s, f) => s + f.montant, 0);
}

export function computeProductionByDate(
  productions: { produit_nom: string; quantite: number; date: string }[],
  date: string
): Record<string, number> {
  const map: Record<string, number> = {};
  productions.filter((p) => p.date === date).forEach((p) => {
    map[p.produit_nom] = (map[p.produit_nom] || 0) + p.quantite;
  });
  return map;
}

export function computeLivraisonByDate(
  livraisons: Livraison[],
  date: string
): Record<string, number> {
  const map: Record<string, number> = {};
  livraisons.filter((l) => l.date === date).forEach((l) => {
    map[l.produit_nom] = (map[l.produit_nom] || 0) + l.vente;
  });
  return map;
}

export type StockLevel = 'normal' | 'bas' | 'critique' | 'negatif';

export function getStockLevel(quantite: number, seuil_bas: number, seuil_critique: number): StockLevel {
  if (quantite < 0) return 'negatif';
  if (quantite <= seuil_critique) return 'critique';
  if (quantite <= seuil_bas) return 'bas';
  return 'normal';
}

export interface StockEvolutionPoint {
  date: string;
  quantite: number;
}

export function computeStockEvolution(
  produit_nom: string,
  mouvements: StockMouvement[],
  days: number = 7
): StockEvolutionPoint[] {
  const now = new Date();
  const points: StockEvolutionPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    let qty = 0;
    mouvements
      .filter((m) => m.produit_nom === produit_nom && m.date <= dateStr)
      .forEach((m) => {
        if (m.type === 'entree') qty += m.quantite;
        else qty -= m.quantite;
      });

    points.push({ date: dateStr, quantite: qty });
  }

  return points;
}

export interface NetVerseDetail {
  livreur_nom: string;
  produit_nom: string;
  net_verse: number;
  finance_id: string | null;
  confirmed: boolean;
}

export function computeNetVerseDetails(
  livraisons: Livraison[],
  finances: FinanceEntry[],
  date: string
): { details: NetVerseDetail[]; totalAttendu: number; totalConfirme: number; totalNonConfirme: number } {
  const todayLivraisons = livraisons.filter((l) => l.date === date && l.net_verse > 0);
  const todayEncaissements = finances.filter((f) => f.date === date && f.type === 'encaissement');

  const details: NetVerseDetail[] = todayLivraisons.map((l) => {
    const matchingFinance = todayEncaissements.find(
      (f) => f.description.includes(l.livreur_nom) && f.description.includes(l.produit_nom)
    );
    return {
      livreur_nom: l.livreur_nom,
      produit_nom: l.produit_nom,
      net_verse: l.net_verse,
      finance_id: matchingFinance?.id ?? null,
      confirmed: matchingFinance?.confirmed ?? false,
    };
  });

  const totalAttendu = details.reduce((s, d) => s + d.net_verse, 0);
  const totalConfirme = details.filter((d) => d.confirmed).reduce((s, d) => s + d.net_verse, 0);
  const totalNonConfirme = details.filter((d) => !d.confirmed).reduce((s, d) => s + d.net_verse, 0);

  return { details, totalAttendu, totalConfirme, totalNonConfirme };
}
