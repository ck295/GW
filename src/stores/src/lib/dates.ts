export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function today(): string {
  return formatDate(new Date());
}

export function yesterday(): string {
  return formatDate(new Date(Date.now() - 86400000));
}

export function isToday(dateStr: string): boolean {
  return dateStr === today();
}

export function isYesterday(dateStr: string): boolean {
  return dateStr === yesterday();
}

export function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

export function isInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}
