import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonChartProps {
  title: string;
  data: Array<{ name: string; aujourd_hui: number; hier: number }>;
  todayColor: string;
  yesterdayColor?: string;
  todayLabel?: string;
  yesterdayLabel?: string;
}

export function ComparisonChart({ title, data, todayColor, yesterdayColor = '#94a3b8', todayLabel = "Aujourd'hui", yesterdayLabel = 'Hier' }: ComparisonChartProps) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-display text-base font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 89%)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(215, 14%, 46%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(215, 14%, 46%)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(214, 18%, 89%)',
              borderRadius: '8px',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="hier" name={yesterdayLabel} fill={yesterdayColor} radius={[4, 4, 0, 0]} />
          <Bar dataKey="aujourd_hui" name={todayLabel} fill={todayColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
