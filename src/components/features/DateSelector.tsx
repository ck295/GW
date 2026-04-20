import { useState } from 'react';
import { today, yesterday, startOfWeek, formatDateFR } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type DateMode = 'today' | 'yesterday' | 'week' | 'custom';

interface DateSelectorProps {
  value: string;
  endValue?: string;
  mode: DateMode;
  onChange: (date: string, endDate: string | undefined, mode: DateMode) => void;
  accentClass?: string;
}

export function DateSelector({ value, endValue, mode, onChange, accentClass = 'bg-teal-500 hover:bg-teal-600' }: DateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleMode = (m: DateMode) => {
    if (m === 'today') onChange(today(), undefined, 'today');
    else if (m === 'yesterday') onChange(yesterday(), undefined, 'yesterday');
    else if (m === 'week') onChange(startOfWeek(), today(), 'week');
    else setShowPicker(true);
  };

  const handlePrev = () => {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const iso = d.toISOString().split('T')[0];
    onChange(iso, undefined, 'custom');
  };

  const handleNext = () => {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const t = today();
    const iso = d.toISOString().split('T')[0];
    if (iso <= t) onChange(iso, undefined, 'custom');
  };

  const isRange = mode === 'week' && endValue;
  const label = isRange
    ? `${formatDateFR(value)} — ${formatDateFR(endValue!)}`
    : formatDateFR(value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        {(['today', 'yesterday', 'week'] as DateMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleMode(m)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              mode === m
                ? `${accentClass} text-white shadow-sm`
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {m === 'today' ? "Aujourd'hui" : m === 'yesterday' ? 'Hier' : 'Semaine'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePrev}
          className="flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Jour précédent"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Calendar className="size-3.5 text-muted-foreground" />
            {label}
          </button>
          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border bg-card p-3 shadow-lg">
                <Input
                  type="date"
                  max={today()}
                  value={value}
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange(e.target.value, undefined, 'custom');
                      setShowPicker(false);
                    }
                  }}
                  className="w-auto"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={value >= today() && !isRange}
          className="flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Jour suivant"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
