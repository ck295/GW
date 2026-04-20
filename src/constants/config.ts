import type { UserRole } from '@/types';
import { LayoutDashboard, Factory, Package, Truck, Wallet, FileBarChart2, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const BASE_SOLDE = 1_000_000;

/** Taux de change initial BCC (Banque Centrale du Congo) — valeurs par défaut */
export const TAUX_USD_CDF_DEFAULT = 2855.0873;
export const TAUX_DATE_DEFAULT = '25/04/2025';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  colorClass: string;
  bgClass: string;
  borderClass: string;
  reportPath?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
    colorClass: 'text-teal-400',
    bgClass: 'bg-teal-400/10',
    borderClass: 'border-teal-400',
  },
  {
    path: '/production',
    label: 'Production',
    icon: Factory,
    roles: ['ADMIN', 'PRODUCTION'],
    colorClass: 'text-production',
    bgClass: 'bg-production/10',
    borderClass: 'border-production',
    reportPath: '/rapports/production',
  },
  {
    path: '/stock',
    label: 'Stock',
    icon: Package,
    roles: ['ADMIN', 'STOCK'],
    colorClass: 'text-stock',
    bgClass: 'bg-stock/10',
    borderClass: 'border-stock',
    reportPath: '/rapports/stock',
  },
  {
    path: '/livraison',
    label: 'Livraison',
    icon: Truck,
    roles: ['ADMIN', 'LIVRAISON'],
    colorClass: 'text-livraison',
    bgClass: 'bg-livraison/10',
    borderClass: 'border-livraison',
    reportPath: '/rapports/livraison',
  },
  {
    path: '/finance',
    label: 'Finance',
    icon: Wallet,
    roles: ['ADMIN', 'FINANCE'],
    colorClass: 'text-finance',
    bgClass: 'bg-finance/10',
    borderClass: 'border-finance',
    reportPath: '/rapports/finance',
  },
  {
    path: '/parametres',
    label: 'Paramètres',
    icon: Settings,
    roles: ['ADMIN'],
    colorClass: 'text-slate-300',
    bgClass: 'bg-slate-400/10',
    borderClass: 'border-slate-400',
  },
];

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  PRODUCTION: '/production',
  STOCK: '/stock',
  LIVRAISON: '/livraison',
  FINANCE: '/finance',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  PRODUCTION: 'Production',
  STOCK: 'Stock',
  LIVRAISON: 'Livraison',
  FINANCE: 'Finance',
};
