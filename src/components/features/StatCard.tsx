import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'production' | 'stock' | 'livraison' | 'finance' | 'primary';
  trend?: { value: number; label: string };
}

const borderColors: Record<string, string> = {
  production: 'border-l-production',
  stock: 'border-l-stock',
  livraison: 'border-l-livraison',
  finance: 'border-l-finance',
  primary: 'border-l-primary',
};

const iconBg: Record<string, string> = {
  production: 'bg-production-light text-production-dark',
  stock: 'bg-stock-light text-stock-dark',
  livraison: 'bg-livraison-light text-livraison-dark',
  finance: 'bg-finance-light text-finance-dark',
  primary: 'bg-primary/10 text-primary',
};

export function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;

  return (
    <div className={cn('rounded-xl border-l-4 bg-card p-5 shadow-sm', borderColors[color])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', iconBg[color])}>
          <Icon className="size-5" />
        </div>
      </div>
      {trend && TrendIcon && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon className={cn('size-4', trend.value > 0 ? 'text-production' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground')} />
          <span className={cn('text-xs font-medium', trend.value > 0 ? 'text-production' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground')}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
