'use client';

import type { AnalysisResult } from '@/lib/types';
import { Area, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface Props {
  analysis: AnalysisResult;
}

export function PayoffChart({ analysis }: Props) {
  return (
    <div data-testid="payoff-chart" className="h-64 rounded border border-zinc-800 bg-zinc-950 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={analysis.payoff} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis dataKey="underlyingPrice" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={(value) => `$${value}`} width={64} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 6 }}
            formatter={(value) => [formatCurrency(Number(value)), 'P/L']}
            labelFormatter={(value) => `Underlying ${formatCurrency(Number(value))}`}
          />
          <ReferenceLine y={0} stroke="#71717a" />
          <Area type="monotone" dataKey="profitLoss" stroke="#38bdf8" fill="#0ea5e9" fillOpacity={0.18} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
