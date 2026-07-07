import { describe, expect, it } from 'vitest';
import type { Leg } from '@/lib/types';
import { generateChain, findQuote } from '@/lib/chains/generate';
import { getUnderlying } from '@/lib/market/constants';
import { analyzeStrategy } from '@/lib/payoff/payoff';
import { buildTemplate } from '@/lib/strategies/templates';
import { getRiskWarnings } from '@/lib/orders/riskWarnings';

const EXPIRATION = '2026-08-21';

function legFromQuote(id: string, side: 'buy' | 'sell', strike: number, type: 'call' | 'put'): Leg {
  const chain = generateChain('AURA');
  const quote = findQuote(chain, EXPIRATION, type, strike);
  return { id, side, instrument: type, quantity: 1, strike, expiration: EXPIRATION, quote };
}

describe('lib/orders/riskWarnings', () => {
  it('test 2: iron condor (defined risk) with liquid legs produces zero warnings', () => {
    // Verified against the real chain generator: CEDR's default iron-condor legs
    // (all four expirations) stay under the 0.08 wide-spread ratio, unlike AURA's
    // nearest expiration where the deep-OTM put wing crosses it. CEDR is the
    // genuinely liquid case this scenario needs.
    const underlying = getUnderlying('CEDR');
    const chain = generateChain('CEDR');
    const chainExpiration = chain.expirations.find((item) => item.expiration.date === EXPIRATION)!;
    const legs = buildTemplate('iron_condor', underlying, chainExpiration);
    const analysis = analyzeStrategy({ underlyingSymbol: 'CEDR', expiration: EXPIRATION, legs, templateId: 'iron_condor' });

    expect(analysis.maxLoss).not.toBe('Unlimited');
    expect(analysis.maxProfit).not.toBe('Unlimited');
    expect(getRiskWarnings(legs, analysis)).toEqual([]);
  });

  it('test 3: a naked short call (maxLoss Unlimited) produces the unlimited_risk warning', () => {
    // Real generated quote for a strike near spot (182.4): 190 call, not a synthetic pair.
    const leg = legFromQuote('short-call', 'sell', 190, 'call');
    const analysis = analyzeStrategy({ underlyingSymbol: 'AURA', expiration: EXPIRATION, legs: [leg] });

    expect(analysis.maxLoss).toBe('Unlimited');
    const warnings = getRiskWarnings([leg], analysis);
    expect(warnings).toContainEqual({ kind: 'unlimited_risk' });
  });

  it('test 4: a leg from a real generated quote with mid under $0.25 triggers wide_spread; a liquid ATM leg does not', () => {
    // Verified against the real AURA chain (2026-08-21): strike 230 call has
    // mid 0.09, bid 0.08, ask 0.10, ratio 0.222 (> 0.08). Strike 180 call has
    // mid 9.22, bid 9.19, ask 9.24, ratio ~0.005 (well under 0.08).
    const wideLeg = legFromQuote('wide-call', 'buy', 230, 'call');
    const liquidLeg = legFromQuote('liquid-call', 'buy', 180, 'call');
    expect(wideLeg.quote!.mid).toBeLessThan(0.25);
    expect((wideLeg.quote!.ask - wideLeg.quote!.bid) / wideLeg.quote!.mid).toBeGreaterThan(0.08);
    expect((liquidLeg.quote!.ask - liquidLeg.quote!.bid) / liquidLeg.quote!.mid).toBeLessThan(0.08);

    const legs = [wideLeg, liquidLeg];
    const analysis = analyzeStrategy({ underlyingSymbol: 'AURA', expiration: EXPIRATION, legs });
    const warnings = getRiskWarnings(legs, analysis);

    expect(warnings).toContainEqual({ kind: 'wide_spread', legId: 'wide-call' });
    expect(warnings.some((warning) => warning.kind === 'wide_spread' && warning.legId === 'liquid-call')).toBe(false);
  });

  it('test 5: exactly 4 legs has no complex_order warning; exactly 5 legs does', () => {
    // AURA's strike ladder near spot 182.4 steps by 10 (80, 90, ..., 280).
    const fourLegs = [
      legFromQuote('l1', 'buy', 160, 'put'),
      legFromQuote('l2', 'sell', 170, 'put'),
      legFromQuote('l3', 'sell', 190, 'call'),
      legFromQuote('l4', 'buy', 200, 'call'),
    ];
    const fourAnalysis = analyzeStrategy({ underlyingSymbol: 'AURA', expiration: EXPIRATION, legs: fourLegs });
    expect(getRiskWarnings(fourLegs, fourAnalysis).some((warning) => warning.kind === 'complex_order')).toBe(false);

    const fiveLegs = [...fourLegs, legFromQuote('l5', 'buy', 210, 'call')];
    const fiveAnalysis = analyzeStrategy({ underlyingSymbol: 'AURA', expiration: EXPIRATION, legs: fiveLegs });
    expect(getRiskWarnings(fiveLegs, fiveAnalysis).some((warning) => warning.kind === 'complex_order')).toBe(true);
  });
});
