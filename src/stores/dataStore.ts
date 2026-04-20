import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Equipe, Livreur, User, UserRole, Production, StockMouvement, Livraison, FinanceEntry } from '@/types';
import {
  MOCK_PRODUCTS, MOCK_EQUIPES, MOCK_LIVREURS, MOCK_USERS,
  MOCK_PRODUCTIONS, MOCK_STOCK_MOUVEMENTS, MOCK_LIVRAISONS, MOCK_FINANCES,
} from '@/constants/mockData';
import { generateId } from '@/lib/utils';
import { today } from '@/lib/dates';

interface ProductionInput {
  equipe_nom: string;
  produit_nom: string;
  quantite: number;
  user_email: string;
}

interface LivraisonInput {
  livreur_nom: string;
  produit_nom: string;
  sortie: number;
  retour: number;
  bonus: number;
  ventes_cash: number;
  ventes_credit: number;
  recouvrements: number;
  user_email: string;
}

interface FinanceInput {
  type: 'encaissement' | 'depense';
  montant: number;
  description: string;
  user_email: string;
  confirmed: boolean;
}

interface DataState {
  products: Product[];
  equipes: Equipe[];
  livreurs: Livreur[];
  users: User[];
  productions: Production[];
  stockMouvements: StockMouvement[];
  livraisons: Livraison[];
  finances: FinanceEntry[];
  addProduction: (input: ProductionInput) => void;
  addLivraison: (input: LivraisonInput) => void;
  addFinance: (input: FinanceInput) => void;
  confirmFinance: (id: string) => void;
  confirmFinanceBulk: (ids: string[]) => void;
  // Product CRUD
  addProduct: (nom: string, prix: number, seuil_bas?: number, seuil_critique?: number) => void;
  updateProduct: (id: string, nom: string, prix: number) => void;
  updateProductThresholds: (id: string, seuil_bas: number, seuil_critique: number) => void;
  deleteProduct: (id: string) => void;
  // Equipe CRUD
  addEquipe: (nom: string) => void;
  updateEquipe: (id: string, nom: string) => void;
  deleteEquipe: (id: string) => void;
  // Livreur CRUD
  addLivreur: (nom: string, vehicule: string) => void;
  updateLivreur: (id: string, nom: string, vehicule: string) => void;
  deleteLivreur: (id: string) => void;
  // User CRUD
  addUser: (email: string, nom: string, role: UserRole) => void;
  updateUserRole: (email: string, role: UserRole) => void;
  updateUserNom: (email: string, nom: string) => void;
  toggleUserActive: (email: string) => void;
  resetData: () => void;
}

const initialState = {
  products: MOCK_PRODUCTS,
  equipes: MOCK_EQUIPES,
  livreurs: MOCK_LIVREURS,
  users: MOCK_USERS,
  productions: MOCK_PRODUCTIONS,
  stockMouvements: MOCK_STOCK_MOUVEMENTS,
  livraisons: MOCK_LIVRAISONS,
  finances: MOCK_FINANCES,
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addProduction: (input) => {
        const id = generateId();
        const dateStr = today();
        const prod: Production = { id, date: dateStr, ...input };
        const stockMvt: StockMouvement = {
          id: generateId(), date: dateStr, produit_nom: input.produit_nom,
          type: 'entree', quantite: input.quantite, source: 'production', reference_id: id,
        };
        set((s) => ({
          productions: [...s.productions, prod],
          stockMouvements: [...s.stockMouvements, stockMvt],
        }));
      },

      addLivraison: (input) => {
        const id = generateId();
        const dateStr = today();
        const product = get().products.find((p) => p.nom === input.produit_nom);
        const prix = product?.prix ?? 0;
        const vente = input.sortie - input.retour - input.bonus;
        const montant_attendu = vente * prix;
        const total_vendu = input.ventes_cash + input.ventes_credit;
        const net_verse = input.ventes_cash + input.recouvrements;

        const liv: Livraison = {
          id, date: dateStr, ...input,
          vente, total_vendu, net_verse, montant_attendu,
        };

        const newMvts: StockMouvement[] = [
          {
            id: generateId(), date: dateStr, produit_nom: input.produit_nom,
            type: 'sortie', quantite: input.sortie, source: 'livraison', reference_id: id,
          },
        ];
        if (input.retour > 0) {
          newMvts.push({
            id: generateId(), date: dateStr, produit_nom: input.produit_nom,
            type: 'entree', quantite: input.retour, source: 'retour', reference_id: id,
          });
        }

        const newFinances: FinanceEntry[] = [];
        if (net_verse > 0) {
          newFinances.push({
            id: generateId(), date: dateStr, type: 'encaissement', montant: net_verse,
            description: `Versement ${input.livreur_nom} — ${input.produit_nom}`,
            user_email: input.user_email, confirmed: false,
          });
        }

        set((s) => ({
          livraisons: [...s.livraisons, liv],
          stockMouvements: [...s.stockMouvements, ...newMvts],
          finances: [...s.finances, ...newFinances],
        }));
      },

      addFinance: (input) => {
        const entry: FinanceEntry = {
          id: generateId(), date: today(), ...input,
        };
        set((s) => ({ finances: [...s.finances, entry] }));
      },

      confirmFinance: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          finances: s.finances.map((f) =>
            f.id === id ? { ...f, confirmed: true, confirmedAt: now } : f
          ),
        }));
      },

      confirmFinanceBulk: (ids) => {
        const now = new Date().toISOString();
        set((s) => ({
          finances: s.finances.map((f) =>
            ids.includes(f.id) ? { ...f, confirmed: true, confirmedAt: now } : f
          ),
        }));
      },

      // Product CRUD
      addProduct: (nom, prix, seuil_bas = 50, seuil_critique = 20) => {
        set((s) => ({ products: [...s.products, { id: generateId(), nom, prix, seuil_bas, seuil_critique }] }));
      },
      updateProduct: (id, nom, prix) => {
        set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, nom, prix } : p) }));
      },
      updateProductThresholds: (id, seuil_bas, seuil_critique) => {
        set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, seuil_bas, seuil_critique } : p) }));
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },

      // Equipe CRUD
      addEquipe: (nom) => {
        set((s) => ({ equipes: [...s.equipes, { id: generateId(), nom }] }));
      },
      updateEquipe: (id, nom) => {
        set((s) => ({ equipes: s.equipes.map((e) => e.id === id ? { ...e, nom } : e) }));
      },
      deleteEquipe: (id) => {
        set((s) => ({ equipes: s.equipes.filter((e) => e.id !== id) }));
      },

      // Livreur CRUD
      addLivreur: (nom, vehicule) => {
        set((s) => ({ livreurs: [...s.livreurs, { id: generateId(), nom, vehicule }] }));
      },
      updateLivreur: (id, nom, vehicule) => {
        set((s) => ({ livreurs: s.livreurs.map((l) => l.id === id ? { ...l, nom, vehicule } : l) }));
      },
      deleteLivreur: (id) => {
        set((s) => ({ livreurs: s.livreurs.filter((l) => l.id !== id) }));
      },

      // User CRUD
      addUser: (email, nom, role) => {
        set((s) => ({ users: [...s.users, { email, nom, role, active: true }] }));
      },
      updateUserRole: (email, role) => {
        set((s) => ({ users: s.users.map((u) => u.email === email ? { ...u, role } : u) }));
      },
      updateUserNom: (email, nom) => {
        set((s) => ({ users: s.users.map((u) => u.email === email ? { ...u, nom } : u) }));
      },
      toggleUserActive: (email) => {
        set((s) => ({ users: s.users.map((u) => u.email === email ? { ...u, active: !u.active } : u) }));
      },

      resetData: () => {
        localStorage.removeItem('pilotflow-data');
        set(initialState);
      },
    }),
    {
      name: 'pilotflow-data',
      partialize: (s) => ({
        products: s.products,
        equipes: s.equipes,
        livreurs: s.livreurs,
        users: s.users,
        productions: s.productions,
        stockMouvements: s.stockMouvements,
        livraisons: s.livraisons,
        finances: s.finances,
      }),
    }
  )
);
