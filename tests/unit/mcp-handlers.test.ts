import { describe, expect, it } from 'vitest';
import { countEventsByName, templatePopularity } from '@/lib/analytics/funnel';
import { EVENT_NAMES } from '@/lib/analytics/events';
import { seededEvents } from '@/lib/analytics/seed';
import { getEventCountsResult, getFunnelResult, getTemplatePopularityResult } from '@/mcp/handlers';

describe('mcp handlers', () => {
  it('getFunnelResult returns reference counts and percentOfChainViewed from seeded data', () => {
    const result = getFunnelResult(seededEvents());

    expect(result.counts).toEqual({
      chain_viewed: 120,
      strategy_built: 75,
      strategy_analyzed: 49,
      order_placed: 27,
      position_closed: 0,
    });
    expect(result.percentOfChainViewed).toEqual({
      chain_viewed: 100,
      strategy_built: 62.5,
      strategy_analyzed: 40.8,
      order_placed: 22.5,
      position_closed: 0,
    });
  });

  it('getFunnelResult returns all-zero counts and percentages for zero events (no NaN)', () => {
    const result = getFunnelResult([]);

    expect(result.counts).toEqual({
      chain_viewed: 0,
      strategy_built: 0,
      strategy_analyzed: 0,
      order_placed: 0,
      position_closed: 0,
    });
    expect(result.percentOfChainViewed).toEqual({
      chain_viewed: 0,
      strategy_built: 0,
      strategy_analyzed: 0,
      order_placed: 0,
      position_closed: 0,
    });
  });

  it('getTemplatePopularityResult matches templatePopularity directly (no duplicate math)', () => {
    const events = seededEvents();
    expect(getTemplatePopularityResult(events)).toEqual(templatePopularity(events));
  });

  it('getTemplatePopularityResult(events, 2) returns the top 2 entries', () => {
    const events = seededEvents();
    const limited = getTemplatePopularityResult(events, 2);
    expect(limited).toHaveLength(2);
    expect(limited).toEqual(templatePopularity(events).slice(0, 2));
  });

  it('getTemplatePopularityResult([]) returns an empty list', () => {
    expect(getTemplatePopularityResult([])).toEqual([]);
  });

  it('getEventCountsResult includes all 10 EVENT_NAMES keys, zero-filling absent ones', () => {
    const events = seededEvents();
    const result = getEventCountsResult(events);
    const direct = countEventsByName(events);

    expect(Object.keys(result).sort()).toEqual([...EVENT_NAMES].sort());
    expect(result.position_closed).toBe(0);
    for (const name of EVENT_NAMES) {
      expect(result[name]).toBe(direct[name] ?? 0);
    }
  });

  it('getEventCountsResult([]) returns all 10 keys at 0', () => {
    const result = getEventCountsResult([]);
    expect(Object.keys(result).sort()).toEqual([...EVENT_NAMES].sort());
    for (const name of EVENT_NAMES) {
      expect(result[name]).toBe(0);
    }
  });
});
