import { describe, expect, it } from 'vitest';
import { generateChain } from '@/lib/chains/generate';
import { getUnderlying } from '@/lib/market/constants';
import { buildTemplate, TEMPLATE_ORDER } from '@/lib/strategies/templates';

describe('strategy templates', () => {
  const chain = generateChain('AURA');
  const underlying = getUnderlying('AURA');
  const expiration = chain.expirations[0];

  it('builds all templates with same-expiration option legs', () => {
    for (const templateId of TEMPLATE_ORDER) {
      const legs = buildTemplate(templateId, underlying, expiration);
      expect(legs.length).toBeGreaterThan(0);
      for (const leg of legs) {
        if (leg.instrument !== 'stock') {
          expect(leg.expiration).toBe(expiration.expiration.date);
          expect(leg.quote).toBeDefined();
        }
      }
    }
  });

  it('builds an iron condor with four option legs', () => {
    const legs = buildTemplate('iron_condor', underlying, expiration);
    expect(legs).toHaveLength(4);
    expect(legs.map((leg) => leg.side)).toEqual(['buy', 'sell', 'sell', 'buy']);
    expect(legs.every((leg) => leg.instrument !== 'stock')).toBe(true);
  });

  it('builds a covered call with stock and short call', () => {
    const legs = buildTemplate('covered_call', underlying, expiration);
    expect(legs[0].instrument).toBe('stock');
    expect(legs[0].quantity).toBe(100);
    expect(legs[1].instrument).toBe('call');
    expect(legs[1].side).toBe('sell');
  });
});
