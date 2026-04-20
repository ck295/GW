import type { Alert } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateFR } from '@/lib/dates';

interface AlertPanelProps {
  alerts: Alert[];
}

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
  warning: 'border-livraison/30 bg-livraison-light text-livraison-dark',
  info: 'border-stock/30 bg-stock-light text-stock-dark',
};

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-display text-base font-semibold text-foreground">Alertes & Contrôles</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Info className="mb-2 size-8 text-production" />
          <p className="text-sm font-medium">Aucune alerte</p>
          <p className="text-xs">Toutes les données sont cohérentes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-display text-base font-semibold text-foreground">
        Alertes & Contrôles
        <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
          {alerts.length}
        </span>
      </h3>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div key={alert.id} className={cn('flex items-start gap-3 rounded-lg border p-3', colorMap[alert.type])}>
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{alert.message}</p>
                <p className="mt-0.5 text-xs opacity-70">{formatDateFR(alert.date)} · {alert.module}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
