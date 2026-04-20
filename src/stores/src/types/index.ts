export type UserRole = 'ADMIN' | 'PRODUCTION' | 'STOCK' | 'LIVRAISON' | 'FINANCE';

export interface Product {
  id: string;
  nom: string;
  prix: number;
  seuil_bas: number;
  seuil_critique: number;
}

export interface Equipe {
  id: string;
  nom: string;
}

export interface Livreur {
  id: string;
  nom: string;
  vehicule: string;
}

export interface User {
  email: string;
  nom: string;
  role: UserRole;
  active: boolean;
}

export interface Production {
  id: string;
  date: string;
  equipe_nom: string;
  produit_nom: string;
  quantite: number;
  user_email: string;
}

export interface StockMouvement {
  id: string;
  date: string;
  produit_nom: string;
  type: 'entree' | 'sortie' | 'declassement';
  quantite: number;
  source: string;
  reference_id: string;
}

export interface Livraison {
  id: string;
  date: string;
  livreur_nom: string;
  produit_nom: string;
  sortie: number;
  retour: number;
  bonus: number;
  ventes_cash: number;
  ventes_credit: number;
  recouvrements: number;
  user_email: string;
  vente: number;
  total_vendu: number;
  net_verse: number;
  montant_attendu: number;
}

export interface FinanceEntry {
  id: string;
  date: string;
  type: 'encaissement' | 'depense';
  montant: number;
  description: string;
  user_email: string;
  confirmed: boolean;
  confirmedAt?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  module: string;
  date: string;
}
