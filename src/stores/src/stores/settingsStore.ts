import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { today } from '@/lib/dates';

export interface TauxHistoryEntry {
  id: string;
  taux: number;
  date: string;
  source: string;
  updatedBy: string;
}

interface SettingsState {
  tauxUsdCdf: number;
  tauxDate: string;
  tauxSource: string;
  tauxHistory: TauxHistoryEntry[];
  updateTaux: (taux: number, source: string, updatedBy: string) => void;
}

const INITIAL_TAUX = 2855.0873;
const INITIAL_DATE = '25/04/2025';
const INITIAL_SOURCE = 'BCC (Banque Centrale du Congo)';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      tauxUsdCdf: INITIAL_TAUX,
      tauxDate: INITIAL_DATE,
      tauxSource: INITIAL_SOURCE,
      tauxHistory: [
        {
          id: 'initial',
          taux: INITIAL_TAUX,
          date: INITIAL_DATE,
          source: INITIAL_SOURCE,
          updatedBy: 'Système',
        },
      ],

      updateTaux: (taux, source, updatedBy) => {
        const dateStr = today();
        const formatted = new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const entry: TauxHistoryEntry = {
          id: generateId(),
          taux,
          date: formatted,
          source,
          updatedBy,
        };
        set((s) => ({
          tauxUsdCdf: taux,
          tauxDate: formatted,
          tauxSource: source,
          tauxHistory: [entry, ...s.tauxHistory],
        }));
      },
    }),
    {
      name: 'pilotflow-settings',
      partialize: (s) => ({
        tauxUsdCdf: s.tauxUsdCdf,
        tauxDate: s.tauxDate,
        tauxSource: s.tauxSource,
        tauxHistory: s.tauxHistory,
      }),
    }
  )
);
