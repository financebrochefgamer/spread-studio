import type { AnalysisResult, Leg } from '@/lib/types';

export interface RiskWarning {
  kind: 'unlimited_risk' | 'wide_spread' | 'complex_order';
  legId?: string;
}

const WIDE_SPREAD_RATIO = 0.08;
const COMPLEX_ORDER_LEG_COUNT = 4;

export function getRiskWarnings(legs: Leg[], analysis: AnalysisResult): RiskWarning[] {
  const warnings: RiskWarning[] = [];

  if (analysis.maxLoss === 'Unlimited' || analysis.maxProfit === 'Unlimited') {
    warnings.push({ kind: 'unlimited_risk' });
  }

  for (const leg of legs) {
    const quote = leg.quote;
    if (!quote || quote.mid <= 0) continue;
    if ((quote.ask - quote.bid) / quote.mid > WIDE_SPREAD_RATIO) {
      warnings.push({ kind: 'wide_spread', legId: leg.id });
    }
  }

  if (legs.length > COMPLEX_ORDER_LEG_COUNT) {
    warnings.push({ kind: 'complex_order' });
  }

  return warnings;
}
