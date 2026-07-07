import type { AnalyticsEvent, TemplateId } from '@/lib/types';
import { EVENT_NAMES } from '@/lib/analytics/events';

function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEMPLATES: TemplateId[] = [
  'long_call',
  'long_put',
  'covered_call',
  'cash_secured_put',
  'bull_call_spread',
  'bear_put_spread',
  'iron_condor',
  'long_straddle',
  'long_strangle',
];

export function seededEvents(): AnalyticsEvent[] {
  const rand = mulberry32(20260706);
  const events: AnalyticsEvent[] = [];
  for (let session = 0; session < 120; session += 1) {
    const sessionId = `seed-${session}`;
    const baseMinute = session * 9;
    const template = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
    const push = (name: AnalyticsEvent['name'], offset: number, properties: AnalyticsEvent['properties'] = {}) => {
      events.push({
        id: `seed-${session}-${name}-${offset}`,
        name,
        timestamp: new Date(Date.UTC(2026, 6, 6, 14, baseMinute + offset)).toISOString(),
        sessionId,
        source: 'seed',
        properties,
      });
    };

    push('page_view', 0, { path: '/' });
    push('chain_viewed', 1, { underlying: 'AURA' });
    if (rand() < 0.62) push('template_selected', 2, { template, underlying: 'AURA' });
    if (rand() < 0.48) push('strategy_analyzed', 3, { underlying: 'AURA', legs: template === 'iron_condor' ? 4 : 2, template });
    if (rand() < 0.18) push('order_placed', 4, { underlying: 'AURA', legs: 2, net_premium: -120 });
  }
  return events.filter((event) => EVENT_NAMES.includes(event.name));
}
