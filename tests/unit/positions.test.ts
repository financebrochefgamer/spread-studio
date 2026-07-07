import { describe, expect, it } from 'vitest';
import type { ClosedPosition, Leg, Order } from '@/lib/types';
import { generateChain } from '@/lib/chains/generate';
import { EXPIRATIONS, getExpiration, getUnderlying } from '@/lib/market/constants';
import { priceOption } from '@/lib/pricing/blackScholes';
import { strategyNetPremium } from '@/lib/payoff/payoff';
import { buildTemplate } from '@/lib/strategies/templates';
import { BASE_SCENARIO, type Scenario } from '@/lib/positions/scenario';
import {
  lookupEntryIv,
  markLeg,
  maxDaysForward,
  valuePortfolio,
  valuePosition,
} from '@/lib/positions/valuation';
import { closePosition, getClosedPositions } from '@/lib/persist/closedPositions';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

function makeOrder(underlyingSymbol: string, templateId: Parameters<typeof buildTemplate>[0], expirationDate?: string): Order {
  const underlying = getUnderlying(underlyingSymbol);
  const chain = generateChain(underlyingSymbol);
  const chainExpiration = expirationDate
    ? chain.expirations.find((item) => item.expiration.date === expirationDate)!
    : chain.expirations[0];
  const legs = buildTemplate(templateId, underlying, chainExpiration);
  return {
    id: `${templateId}-order`,
    createdAt: '2026-07-06T14:00:00.000Z',
    underlyingSymbol,
    expiration: chainExpiration.expiration.date,
    legs,
    netPremium: strategyNetPremium(legs),
  };
}

describe('lib/positions/valuation', () => {
  it('test 1: base round trip - unrealized P&L is near zero at BASE_SCENARIO', () => {
    const order = makeOrder('AURA', 'iron_condor');
    const valuation = valuePosition(order, BASE_SCENARIO);
    // Tolerance accounts for the chain's bid/ask midpoint rounding (~1 cent/share =
    // ~$1/contract after the x100 multiplier) per leg.
    expect(Math.abs(valuation.unrealizedPl)).toBeLessThan(order.legs.length * 2);
  });

  it('test 2: intrinsic at expiration - full DTE gives intrinsic-only marks under shifted spot', () => {
    const order = makeOrder('AURA', 'long_call');
    const leg = order.legs[0];
    const underlying = getUnderlying('AURA');
    const dte = getExpiration(leg.expiration!).daysToExpiration;
    const iv = lookupEntryIv(leg, 'AURA');
    const scenario: Scenario = { spotShiftPct: 10, volShiftPts: 0, daysForward: dte };

    const mark = markLeg(leg, iv, underlying, scenario);
    const shiftedSpot = underlying.spot * 1.1;
    const intrinsic = Math.max(0, shiftedSpot - (leg.strike ?? 0));
    expect(mark).toBeCloseTo(intrinsic, 6);
  });

  it('test 3: vol floor - volShiftPts of -20 never yields vol below 0.01', () => {
    const underlying = getUnderlying('AURA');
    const expirationDate = EXPIRATIONS[0].date;
    const leg: Leg = {
      id: 'floor-test',
      instrument: 'call',
      side: 'buy',
      quantity: 1,
      strike: underlying.spot,
      expiration: expirationDate,
    };
    const lowIv = 0.05; // low entry IV so a -20 vol point shift would go negative
    const scenario: Scenario = { spotShiftPct: 0, volShiftPts: -20, daysForward: 0 };

    const mark = markLeg(leg, lowIv, underlying, scenario);
    const expiration = getExpiration(expirationDate);
    const manual = priceOption({
      type: 'call',
      spot: underlying.spot,
      strike: leg.strike ?? 0,
      yearsToExpiration: expiration.daysToExpiration / 365,
      volatility: 0.01,
      riskFreeRate: 0.04,
    });
    expect(mark).toBeCloseTo(manual.price, 6);
  });

  it('test 4: long call theta - value strictly decreases as daysForward increases', () => {
    const order = makeOrder('AURA', 'long_call');
    const leg = order.legs[0];
    const underlying = getUnderlying('AURA');
    const iv = lookupEntryIv(leg, 'AURA');

    const v0 = markLeg(leg, iv, underlying, { spotShiftPct: 0, volShiftPts: 0, daysForward: 0 });
    const v5 = markLeg(leg, iv, underlying, { spotShiftPct: 0, volShiftPts: 0, daysForward: 5 });
    const v10 = markLeg(leg, iv, underlying, { spotShiftPct: 0, volShiftPts: 0, daysForward: 10 });

    expect(v5).toBeLessThan(v0);
    expect(v10).toBeLessThan(v5);
  });

  it('test 5: credit position - short put P&L near zero at entry, positive as days roll forward', () => {
    const order = makeOrder('AURA', 'cash_secured_put');
    // A short put is a credit; this repo's convention is netPremium > 0 is a debit,
    // so a credit position has netPremium < 0.
    expect(order.netPremium).toBeLessThan(0);

    const base = valuePosition(order, BASE_SCENARIO);
    expect(Math.abs(base.unrealizedPl)).toBeLessThan(order.legs.length * 2);

    const forward = valuePosition(order, { spotShiftPct: 0, volShiftPts: 0, daysForward: 10 });
    expect(forward.unrealizedPl).toBeGreaterThan(0);
  });

  it('test 6: portfolio aggregation with a covered call - delta share-equivalent, other greeks option-only', () => {
    const order = makeOrder('AURA', 'covered_call');
    const stockLeg = order.legs.find((leg) => leg.instrument === 'stock')!;
    const callLeg = order.legs.find((leg) => leg.instrument === 'call')!;
    const callGreeks = callLeg.quote!.greeks;

    const valuation = valuePosition(order, BASE_SCENARIO);

    expect(valuation.greeks.delta).toBeCloseTo(stockLeg.quantity - 100 * callGreeks.delta, 1);
    expect(valuation.greeks.gamma).toBeCloseTo(callGreeks.gamma * -100, 1);
    expect(valuation.greeks.theta).toBeCloseTo(callGreeks.theta * -100, 1);
    expect(valuation.greeks.vega).toBeCloseTo(callGreeks.vega * -100, 1);
  });

  it('valuePortfolio sums P&L and greeks across open positions', () => {
    const orderA = makeOrder('AURA', 'long_call');
    const orderB = makeOrder('BOLT', 'cash_secured_put');
    const portfolio = valuePortfolio([orderA, orderB], BASE_SCENARIO);
    const a = valuePosition(orderA, BASE_SCENARIO);
    const b = valuePosition(orderB, BASE_SCENARIO);

    expect(portfolio.totalPl).toBeCloseTo(a.unrealizedPl + b.unrealizedPl, 2);
    expect(portfolio.greeks.delta).toBeCloseTo(a.greeks.delta + b.greeks.delta, 2);
  });

  it('test 7: closePosition idempotence and open-list derivation', () => {
    (globalThis as unknown as { window: unknown }).window = { localStorage: new MemoryStorage() };

    const orderA = makeOrder('AURA', 'long_call');
    const orderB = makeOrder('BOLT', 'cash_secured_put');

    const firstRecord: ClosedPosition = {
      orderId: orderA.id,
      exitValue: 100,
      realizedPl: 50,
      closedAt: '2026-07-06T15:00:00.000Z',
    };
    closePosition(firstRecord);
    // Second close of the same order is a no-op (idempotent).
    closePosition({ orderId: orderA.id, exitValue: 999, realizedPl: 999, closedAt: '2026-07-06T16:00:00.000Z' });

    const closed = getClosedPositions();
    expect(closed).toHaveLength(1);
    expect(closed[0]).toEqual(firstRecord);

    const closedIds = new Set(closed.map((item) => item.orderId));
    const openOrders = [orderA, orderB].filter((order) => !closedIds.has(order.id));
    expect(openOrders).toEqual([orderB]);

    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('test 8: maxDaysForward is 0 for no orders and the min DTE across mixed expirations', () => {
    expect(maxDaysForward([])).toBe(0);

    const chain = generateChain('AURA');
    const nearExpiration = chain.expirations[0];
    const farExpiration = chain.expirations[chain.expirations.length - 1];
    const nearOrder = makeOrder('AURA', 'long_call', nearExpiration.expiration.date);
    const farOrder = makeOrder('AURA', 'long_put', farExpiration.expiration.date);

    expect(maxDaysForward([farOrder, nearOrder])).toBe(nearExpiration.expiration.daysToExpiration);
  });
});
