'use client';

import type { AnalysisResult } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

interface Props {
  analysis: AnalysisResult;
}

export function MetricsGrid({ analysis }: Props) {
  const breakevens = analysis.breakevens.length > 0
    ? analysis.breakevens.map((value) => formatCurrency(value)).join(' / ')
    : 'None';

  return (
    <div className="grid grid-cols-2 gap-2">
      <Metric label="Net premium" value={formatCurrency(analysis.netPremium)} tone={analysis.netPremium <= 0 ? 'profit' : 'loss'} />
      <Metric label="Max profit" value={formatCurrency(analysis.maxProfit)} tone="profit" />
      <Metric label="Max loss" value={formatCurrency(analysis.maxLoss)} tone="loss" testId="metric-max-loss" />
      <Metric label="Breakevens" value={breakevens} testId="metric-breakevens" />
    </div>
  );
}

function Metric({ label, value, tone, testId }: { label: string; value: string; tone?: 'profit' | 'loss'; testId?: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div data-testid={testId} className={`num mt-1 text-sm font-semibold ${tone === 'profit' ? 'profit' : tone === 'loss' ? 'loss' : 'text-zinc-100'}`}>
        {value}
      </div>
    </div>
  );
}
