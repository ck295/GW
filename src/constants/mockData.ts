import type { Product, Equipe, Livreur, User, Production, Livraison, StockMouvement, FinanceEntry } from '@/types';
import { formatDate } from '@/lib/dates';

const t = formatDate(new Date());
const y = formatDate(new Date(Date.now() - 86400000));

export const MOCK_PRODUCTS: Product[] = [
  { id: 'pr1', nom: 'Eau Minérale 1.5L', prix: 1500, seuil_bas: 80, seuil_critique: 30 },
  { id: 'pr2', nom: 'Eau Minérale 0.5L', prix: 750, seuil_bas: 100, seuil_critique: 40 },
  { id: 'pr3', nom: 'Jus d\'Orange 1L', prix: 3000, seuil_bas: 50, seuil_critique: 20 },
  { id: 'pr4', nom: 'Jus de Mangue 1L', prix: 3000, seuil_bas: 50, seuil_critique: 20 },
  { id: 'pr5', nom: 'Soda Cola 33cl', prix: 1000, seuil_bas: 80, seuil_critique: 30 },
  { id: 'pr6', nom: 'Soda Orange 33cl', prix: 1000, seuil_bas: 80, seuil_critique: 30 },
  { id: 'pr7', nom: 'Eau Gazeuse 1L', prix: 2000, seuil_bas: 60, seuil_critique: 25 },
  { id: 'pr8', nom: 'Lait Frais 1L', prix: 2500, seuil_bas: 40, seuil_critique: 15 },
];

export const MOCK_EQUIPES: Equipe[] = [
  { id: 'eq1', nom: 'Équipe Matin' },
  { id: 'eq2', nom: 'Équipe Après-midi' },
  { id: 'eq3', nom: 'Équipe Nuit' },
];

export const MOCK_LIVREURS: Livreur[] = [
  { id: 'lv1', nom: 'Amadou Diallo', vehicule: 'Camion A-1204' },
  { id: 'lv2', nom: 'Moussa Traoré', vehicule: 'Camion B-3391' },
  { id: 'lv3', nom: 'Ibrahim Koné', vehicule: 'Fourgon C-0872' },
  { id: 'lv4', nom: 'Omar Diop', vehicule: 'Camion D-5567' },
  { id: 'lv5', nom: 'Youssef Camara', vehicule: 'Fourgon E-2210' },
];

export const MOCK_USERS: User[] = [
  { email: 'admin@pilotflow.com', nom: 'Directeur Général', role: 'ADMIN', active: true },
  { email: 'admin2@pilotflow.com', nom: 'Directeur Adjoint', role: 'ADMIN', active: true },
  { email: 'prod@pilotflow.com', nom: 'Chef de Production', role: 'PRODUCTION', active: true },
  { email: 'stock@pilotflow.com', nom: 'Responsable Stock', role: 'STOCK', active: true },
  { email: 'livraison@pilotflow.com', nom: 'Coordinateur Livraison', role: 'LIVRAISON', active: true },
  { email: 'finance@pilotflow.com', nom: 'Responsable Finance', role: 'FINANCE', active: true },
];

function mkProd(id: string, date: string, eq: string, pr: string, qty: number): Production {
  return { id, date, equipe_nom: eq, produit_nom: pr, quantite: qty, user_email: 'prod@pilotflow.com' };
}

export const MOCK_PRODUCTIONS: Production[] = [
  mkProd('p01', y, 'Équipe Matin', 'Eau Minérale 1.5L', 200),
  mkProd('p02', y, 'Équipe Matin', 'Eau Minérale 0.5L', 350),
  mkProd('p03', y, 'Équipe Matin', 'Jus d\'Orange 1L', 120),
  mkProd('p04', y, 'Équipe Après-midi', 'Soda Cola 33cl', 280),
  mkProd('p05', y, 'Équipe Après-midi', 'Soda Orange 33cl', 200),
  mkProd('p06', y, 'Équipe Après-midi', 'Jus de Mangue 1L', 150),
  mkProd('p07', y, 'Équipe Nuit', 'Eau Gazeuse 1L', 180),
  mkProd('p08', y, 'Équipe Nuit', 'Lait Frais 1L', 100),
  mkProd('p09', t, 'Équipe Matin', 'Eau Minérale 1.5L', 250),
  mkProd('p10', t, 'Équipe Matin', 'Eau Minérale 0.5L', 300),
  mkProd('p11', t, 'Équipe Matin', 'Jus d\'Orange 1L', 150),
  mkProd('p12', t, 'Équipe Après-midi', 'Soda Cola 33cl', 300),
  mkProd('p13', t, 'Équipe Après-midi', 'Jus de Mangue 1L', 120),
  mkProd('p14', t, 'Équipe Nuit', 'Eau Gazeuse 1L', 200),
  mkProd('p15', t, 'Équipe Nuit', 'Lait Frais 1L', 120),
];

function mkLiv(
  id: string, date: string, livreur: string, produit: string, prix: number,
  sortie: number, retour: number, bonus: number, cash: number, credit: number, recouv: number
): Livraison {
  const vente = sortie - retour - bonus;
  return {
    id, date, livreur_nom: livreur, produit_nom: produit,
    sortie, retour, bonus,
    ventes_cash: cash, ventes_credit: credit, recouvrements: recouv,
    user_email: 'livraison@pilotflow.com',
    vente,
    total_vendu: cash + credit,
    net_verse: cash + recouv,
    montant_attendu: vente * prix,
  };
}

export const MOCK_LIVRAISONS: Livraison[] = [
  mkLiv('l01', y, 'Amadou Diallo', 'Eau Minérale 1.5L', 1500, 80, 5, 3, 97200, 10800, 0),
  mkLiv('l02', y, 'Moussa Traoré', 'Eau Minérale 0.5L', 750, 120, 10, 5, 67500, 11250, 3000),
  mkLiv('l03', y, 'Ibrahim Koné', 'Jus d\'Orange 1L', 3000, 50, 3, 2, 121500, 13500, 0),
  mkLiv('l04', y, 'Omar Diop', 'Soda Cola 33cl', 1000, 100, 8, 5, 78300, 8700, 6000),
  mkLiv('l05', y, 'Youssef Camara', 'Soda Orange 33cl', 1000, 80, 5, 3, 64800, 7200, 1500),
  mkLiv('l06', y, 'Amadou Diallo', 'Jus de Mangue 1L', 3000, 60, 4, 2, 145800, 16200, 0),
  mkLiv('l07', t, 'Amadou Diallo', 'Eau Minérale 1.5L', 1500, 100, 8, 4, 118800, 13200, 3000),
  mkLiv('l08', t, 'Moussa Traoré', 'Eau Minérale 0.5L', 750, 130, 12, 3, 76125, 10125, 6000),
  mkLiv('l09', t, 'Ibrahim Koné', 'Soda Cola 33cl', 1000, 120, 10, 5, 94500, 10500, 0),
  mkLiv('l10', t, 'Omar Diop', 'Jus d\'Orange 1L', 3000, 60, 5, 2, 143100, 15900, 4500),
  mkLiv('l11', t, 'Youssef Camara', 'Eau Gazeuse 1L', 2000, 70, 6, 2, 111600, 12400, 0),
  mkLiv('l12', t, 'Moussa Traoré', 'Jus de Mangue 1L', 3000, 45, 3, 2, 108000, 12000, 0),
];

function deriveStockMovements(productions: Production[], livraisons: Livraison[]): StockMouvement[] {
  const mvts: StockMouvement[] = [];
  productions.forEach((p) => {
    mvts.push({ id: `sm-p-${p.id}`, date: p.date, produit_nom: p.produit_nom, type: 'entree', quantite: p.quantite, source: 'production', reference_id: p.id });
  });
  livraisons.forEach((l) => {
    mvts.push({ id: `sm-ls-${l.id}`, date: l.date, produit_nom: l.produit_nom, type: 'sortie', quantite: l.sortie, source: 'livraison', reference_id: l.id });
    if (l.retour > 0) {
      mvts.push({ id: `sm-lr-${l.id}`, date: l.date, produit_nom: l.produit_nom, type: 'entree', quantite: l.retour, source: 'retour', reference_id: l.id });
    }
  });
  mvts.push({ id: 'sm-d1', date: y, produit_nom: 'Eau Minérale 0.5L', type: 'declassement', quantite: 15, source: 'controle_qualite', reference_id: 'decl-1' });
  mvts.push({ id: 'sm-d2', date: t, produit_nom: 'Soda Cola 33cl', type: 'declassement', quantite: 10, source: 'controle_qualite', reference_id: 'decl-2' });
  return mvts;
}

function deriveFinanceEntries(livraisons: Livraison[]): FinanceEntry[] {
  const entries: FinanceEntry[] = [];
  livraisons.forEach((l) => {
    if (l.net_verse > 0) {
      entries.push({
        id: `fin-${l.id}`, date: l.date, type: 'encaissement', montant: l.net_verse,
        description: `Versement ${l.livreur_nom} — ${l.produit_nom}`,
        user_email: 'finance@pilotflow.com', confirmed: true,
      });
    }
  });
  entries.push({ id: 'fin-dep1', date: y, type: 'depense', montant: 75000, description: 'Carburant véhicules', user_email: 'finance@pilotflow.com', confirmed: true });
  entries.push({ id: 'fin-dep2', date: y, type: 'depense', montant: 45000, description: 'Fournitures bureau', user_email: 'finance@pilotflow.com', confirmed: true });
  entries.push({ id: 'fin-dep3', date: t, type: 'depense', montant: 90000, description: 'Transport marchandises', user_email: 'finance@pilotflow.com', confirmed: true });
  return entries;
}

export const MOCK_STOCK_MOUVEMENTS: StockMouvement[] = deriveStockMovements(MOCK_PRODUCTIONS, MOCK_LIVRAISONS);
export const MOCK_FINANCES: FinanceEntry[] = deriveFinanceEntries(MOCK_LIVRAISONS);
