import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { NAV_ITEMS } from '@/constants/config';
import { cn } from '@/lib/utils';
import { X, RotateCcw, Hexagon, FileBarChart2, ShoppingCart, Users, UserCog } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const resetData = useDataStore((s) => s.resetData);
  const role = currentUser?.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <div className="flex h-full flex-col bg-navy text-slate-300">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <Hexagon className="size-8 text-teal-400" strokeWidth={2.5} />
          <span className="font-display text-xl font-bold tracking-tight text-white">GRAA WATER

          </span>
        </Link>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-white/10 lg:hidden"
          aria-label="Fermer le menu">
          
          <X className="size-5" />
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const active = location.pathname === item.path;
          const reportActive = item.reportPath ? location.pathname === item.reportPath : false;
          const Icon = item.icon;
          return (
            <div key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                  active ?
                  `bg-white/10 text-white border-l-[3px] ${item.borderClass} pl-[9px]` :
                  'border-l-[3px] border-transparent pl-[9px] hover:bg-white/5 hover:text-white'
                )}>
                
                <Icon className={cn('size-5', active ? item.colorClass : 'text-slate-400')} />
                {item.label}
              </Link>
              {item.reportPath &&
              <Link
                to={item.reportPath}
                onClick={onClose}
                className={cn(
                  'ml-8 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  reportActive ?
                  `text-white ${item.bgClass}` :
                  'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                )}>
                
                  <FileBarChart2 className="size-3.5" />
                  Rapport
                </Link>
              }
              {item.path === '/parametres' && role === 'ADMIN' &&
              <>
                  <Link
                  to="/parametres/produits"
                  onClick={onClose}
                  className={cn(
                    'ml-8 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    location.pathname === '/parametres/produits' ?
                    'text-white bg-slate-400/10' :
                    'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  )}>
                  
                    <ShoppingCart className="size-3.5" />
                    Produits
                  </Link>
                  <Link
                  to="/parametres/agents"
                  onClick={onClose}
                  className={cn(
                    'ml-8 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    location.pathname === '/parametres/agents' ?
                    'text-white bg-slate-400/10' :
                    'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  )}>
                  
                    <Users className="size-3.5" />
                    Agents
                  </Link>
                  <Link
                  to="/parametres/utilisateurs"
                  onClick={onClose}
                  className={cn(
                    'ml-8 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    location.pathname === '/parametres/utilisateurs' ?
                    'text-white bg-slate-400/10' :
                    'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  )}>
                  
                    <UserCog className="size-3.5" />
                    Utilisateurs
                  </Link>
                </>
              }
            </div>);

        })}
      </nav>

      {role === 'ADMIN' &&
      <div className="border-t border-white/10 px-4 py-3">
          <button
          onClick={() => {resetData();window.location.reload();}}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white">
          
            <RotateCcw className="size-4" />
            Réinitialiser les données
          </button>
        </div>
      }

      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium text-white">{currentUser?.nom}</p>
        <p className="truncate text-xs text-slate-400">{currentUser?.email}</p>
      </div>
    </div>);

}