import { useState } from 'react';
import { today, yesterday, formatDateFR } from '@/lib/dates';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calendar, ArrowRightLeft } from 'lucide-react';

type Preset = 'today-yesterday' | 'custom';

interface DashboardDateSelectorProps {
  dateA: string;
  dateB: string;
  onChange: (dateA: string, dateB: string) => void;
}

const QUICK_PRESETS = [
  { id: 'today-yesterday', label: "Aujourd'hui vs Hier", getA: today, getB: yesterday },
  { id: 'yesterday-2days', label: 'Hier vs Avant-hier', getA: yesterday, getB: () => {
    const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0];
  }},
  { id: 'week-start', label: "Auj. vs Lundi", getA: today, getB: () => {
    const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d.toISOString().split('T')[0];
  }},
] as const;

export function DashboardDateSelector({ dateA, dateB, onChange }: DashboardDateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);

  const activePreset = QUICK_PRESETS.find((p) => p.getA() === dateA && p.getB() === dateB)?.id ?? 'custom';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick presets */}
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.getA(), preset.getB())}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              activePreset === preset.id
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date display / picker toggle */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            showPicker ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-card hover:bg-muted'
          )}
        >
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="tabular-nums">{formatDateFR(dateA)}</span>
          <ArrowRightLeft className="size-3 text-muted-foreground" />
          <span className="tabular-nums">{formatDateFR(dateB)}</span>
        </button>

        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div className="absolute right-0 top-full z-50 mt-1.5 rounded-xl border bg-card p-4 shadow-xl min-w-[300px]">
              <p className="text-xs font-semibold text-foreground mb-3">Choisir deux dates à comparer</p>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-teal-600 font-semibold">Date principale (A)</Label>
                  <Input
                    type="date"
                    max={today()}
                    value={dateA}
                    onChange={(e) => {
                      if (e.target.value) onChange(e.target.value, dateB);
                    }}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">{formatDateFR(dateA)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-px w-8 bg-border" />
                    <ArrowRightLeft className="size-3" />
                    <span>vs</span>
                    <div className="h-px w-8 bg-border" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-semibold">Date de comparaison (B)</Label>
                  <Input
                    type="date"
                    max={today()}
                    value={dateB}
                    onChange={(e) => {
                      if (e.target.value) onChange(dateA, e.target.value);
                    }}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">{formatDateFR(dateB)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="mt-3 w-full rounded-lg bg-teal-500 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
