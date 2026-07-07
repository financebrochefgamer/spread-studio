import { describe, expect, it } from 'vitest';
import type { AnalyticsEvent } from '@/lib/types';
import { aggregateFunnel, countEventsByName, templatePopularity } from '@/lib/analytics/funnel';
import { seededEvents } from '@/lib/analytics/seed';

function event(sessionId: string, name: AnalyticsEvent['name'], properties: AnalyticsEvent['properties'] = {}): AnalyticsEvent {
  return {
    id: `${sessionId}-${name}`,
    name,
    timestamp: '2026-07-06T14:00:00.000Z',
    sessionId,
    source: 'live',
    properties,
  };
}

describe('analytics aggregation', () => {
  it('counts funnel stages per session', () => {
    const events = [
      event('s1', 'chain_viewed'),
      event('s1', 'template_selected', { template: 'iron_condor' }),
      event('s1', 'strategy_analyzed'),
      event('s1', 'order_placed'),
      event('s2', 'chain_viewed'),
      event('s2', 'leg_edited'),
    ];

    expect(aggregateFunnel(events)).toEqual({
      chain_viewed: 2,
      strategy_built: 2,
      strategy_analyzed: 1,
      order_placed: 1,
    });
  });

  it('sorts template popularity', () => {
    const events = [
      event('s1', 'template_selected', { template: 'iron_condor' }),
      event('s2', 'template_selected', { template: 'iron_condor' }),
      event('s3', 'template_selected', { template: 'long_call' }),
    ];

    expect(templatePopularity(events)[0]).toEqual({ template: 'iron_condor', count: 2 });
  });

  it('generates deterministic seed data', () => {
    const first = seededEvents();
    const second = seededEvents();

    expect(first).toEqual(second);
    expect(aggregateFunnel(first).chain_viewed).toBeGreaterThan(0);
    expect(countEventsByName(first).page_view).toBeGreaterThan(0);
  });
});
