import { describe, expect, it } from 'vitest';
import type { Leg, OptionQuote, Strategy } from '@/lib/types';
import { analyzeStrategy, legPayoffAtExpiration, strategyNetPremium } from '@/lib/payoff/payoff';

function quote(type: 'call' | 'put', strike: number, mid: number): OptionQuote {
  return {
    underlyingSymbol: 'AURA',
    expiration: '2026-08-21',
    strike,
    type,
    bid: mid - 0.05,
    ask: mid + 0.05,
    mid,
    iv: 0.25,
    greeks: { delta: type === 'call' ? 0.5 : -0.5, gamma: 0.01, theta: -0.02, vega: 0.15 },
  };
}

function optionLeg(id: string, side: 'buy' | 'sell', type: 'call' | 'put', strike: number, mid: number): Leg {
  return {
    id,
    side,
    instrument: type,
    quantity: 1,
    strike,
    expiration: '2026-08-21',
    quote: quote(type, strike, mid),
  };
}

function strategy(legs: Leg[]): Strategy {
  return {
    underlyingSymbol: 'AURA',
    expiration: '2026-08-21',
    legs,
  };
}

describe('payoff analysis', () => {
  it('calculates long call payoff and premium', () => {
    const leg = optionLeg('long-call', 'buy', 'call', 100, 5);

    expect(strategyNetPremium([leg])).toBe(500);
    expect(legPayoffAtExpiration(leg, 120)).toBe(1500);
    expect(legPayoffAtExpiration(leg, 90)).toBe(-500);

    const analysis = analyzeStrategy(strategy([leg]));
    expect(analysis.maxProfit).toBe('Unlimited');
    expect(analysis.maxLoss).toBe(-500);
    expect(analysis.breakevens).toContain(105);
  });

  it('detects unlimited loss for a short call', () => {
    const analysis = analyzeStrategy(strategy([optionLeg('short-call', 'sell', 'call', 100, 5)]));
    expect(analysis.maxLoss).toBe('Unlimited');
    expect(analysis.maxProfit).toBe(500);
  });

  it('calculates finite risk for a bull call vertical', () => {
    const legs = [
      optionLeg('buy-100', 'buy', 'call', 100, 5),
      optionLeg('sell-110', 'sell', 'call', 110, 2),
    ];
    const analysis = analyzeStrategy(strategy(legs));

    expect(analysis.netPremium).toBe(300);
    expect(analysis.maxLoss).toBe(-300);
    expect(analysis.maxProfit).toBe(700);
    expect(analysis.breakevens).toContain(103);
  });

  it('aggregates covered call greeks with the contract multiplier applied to option legs', () => {
    const stockLeg: Leg = { id: 'stock', instrument: 'stock', side: 'buy', quantity: 100, stockPrice: 100 };
    const callLeg = optionLeg('short-call', 'sell', 'call', 105, 2);
    const callGreeks = callLeg.quote!.greeks;

    const analysis = analyzeStrategy(strategy([stockLeg, callLeg]));

    expect(analysis.greeks.delta).toBeCloseTo(100 - 100 * callGreeks.delta, 5);
    expect(analysis.greeks.gamma).toBeCloseTo(callGreeks.gamma * -100, 5);
    expect(analysis.greeks.theta).toBeCloseTo(callGreeks.theta * -100, 5);
    expect(analysis.greeks.vega).toBeCloseTo(callGreeks.vega * -100, 5);
  });
});
