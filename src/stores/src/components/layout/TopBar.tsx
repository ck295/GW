import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS, NAV_ITEMS } from '@/constants/config';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  const currentNav = NAV_ITEMS.find((n) => n.path === location.pathname);
  const pageTitle = currentNav?.label ?? 'PilotFlow';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 hover:bg-accent lg:hidden"
          aria-label="Menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-display text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {currentUser && (
          <Badge variant="secondary" className="hidden sm:inline-flex font-medium">
            {ROLE_LABELS[currentUser.role]}
          </Badge>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  );
}
