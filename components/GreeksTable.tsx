'use client';

import type { AnalysisResult } from '@/lib/types';
import { formatNumber } from '@/lib/format';

interface Props {
  analysis: AnalysisResult;
}

export function GreeksTable({ analysis }: Props) {
  return (
    <table className="w-full text-xs">
      <thead className="text-zinc-500">
        <tr>
          <th className="py-1 text-left">Greek</th>
          <th className="py-1 text-right">Net</th>
        </tr>
      </thead>
      <tbody className="text-zinc-200">
        <GreekRow label="Delta" value={analysis.greeks.delta} />
        <GreekRow label="Gamma" value={analysis.greeks.gamma} digits={4} />
        <GreekRow label="Theta/day" value={analysis.greeks.theta} />
        <GreekRow label="Vega/pt" value={analysis.greeks.vega} />
      </tbody>
    </table>
  );
}

function GreekRow({ label, value, digits = 2 }: { label: string; value: number; digits?: number }) {
  return (
    <tr className="border-t border-zinc-900">
      <td className="py-1.5 text-zinc-400">{label}</td>
      <td className="num py-1.5">{formatNumber(value, digits)}</td>
    </tr>
  );
}
