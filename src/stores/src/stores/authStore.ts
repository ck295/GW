import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { ROLE_DEFAULT_ROUTES } from '@/constants/config';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  getDefaultRoute: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (email: string, usersList?: User[]) => {
        const users = usersList ?? JSON.parse(localStorage.getItem('pilotflow-data') || '{"users":[]}').users ?? [];
        const user = users.find((u: User) => u.email === email);
        if (!user) return false;
        if (!user.active) return false;
        set({ currentUser: user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      getDefaultRoute: () => {
        const user = get().currentUser;
        if (!user) return '/login';
        return ROLE_DEFAULT_ROUTES[user.role];
      },
    }),
    {
      name: 'pilotflow-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
