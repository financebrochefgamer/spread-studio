import type { Greeks, Leg, Order, OptionQuote, OptionType, Underlying } from '@/lib/types';
import { findQuote, generateChain } from '@/lib/chains/generate';
import { RISK_FREE_RATE, getExpiration, getUnderlying } from '@/lib/market/constants';
import { priceOption, type PriceOptionResult } from '@/lib/pricing/blackScholes';
import type { Scenario } from '@/lib/positions/scenario';

const CONTRACT_MULTIPLIER = 100;

function round2(value: number): number {
  if (!Number.isFinite(value)) return value;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function zeroGreeks(): Greeks {
  return { delta: 0, gamma: 0, theta: 0, vega: 0 };
}

function addScaledGreeks(sum: Greeks, greeks: Greeks, factor: number): Greeks {
  return {
    delta: sum.delta + greeks.delta * factor,
    gamma: sum.gamma + greeks.gamma * factor,
    theta: sum.theta + greeks.theta * factor,
    vega: sum.vega + greeks.vega * factor,
  };
}

function findEntryQuote(leg: Leg, underlyingSymbol: string): OptionQuote | undefined {
  if (leg.instrument === 'stock' || leg.strike === undefined || !leg.expiration) return undefined;
  try {
    const chain = generateChain(underlyingSymbol);
    return findQuote(chain, leg.expiration, leg.instrument, leg.strike);
  } catch {
    return undefined;
  }
}

/**
 * The leg's static entry-chain IV, looked up by strike/type/expiration (not re-derived
 * from the chain's term structure as scenario inputs change). Legs always originate
 * from the chain, so a missing quote is a programming error; fall back to the leg's
 * own recorded quote IV rather than throwing.
 */
export function lookupEntryIv(leg: Leg, underlyingSymbol: string): number {
  const quote = findEntryQuote(leg, underlyingSymbol);
  if (quote) return quote.iv;
  return leg.quote?.iv ?? 0;
}

function shiftedSpot(underlying: Underlying, scenario: Scenario): number {
  return underlying.spot * (1 + scenario.spotShiftPct / 100);
}

function priceLeg(leg: Leg, iv: number, underlying: Underlying, scenario: Scenario): PriceOptionResult {
  const expiration = getExpiration(leg.expiration!);
  const yearsToExpiration = Math.max(0, expiration.daysToExpiration / 365 - scenario.daysForward / 365);
  const volatility = Math.max(0.01, iv + scenario.volShiftPts / 100);
  return priceOption({
    type: leg.instrument as OptionType,
    spot: shiftedSpot(underlying, scenario),
    strike: leg.strike ?? 0,
    yearsToExpiration,
    volatility,
    riskFreeRate: RISK_FREE_RATE,
  });
}

/**
 * Signed per-share model value for one leg (buy legs positive, sell legs negative).
 * Stock legs value at shifted spot; option legs reuse priceOption (single pricing
 * path shared with the chain).
 */
export function markLeg(leg: Leg, iv: number, underlying: Underlying, scenario: Scenario): number {
  const direction = leg.side === 'buy' ? 1 : -1;
  if (leg.instrument === 'stock') {
    return direction * shiftedSpot(underlying, scenario);
  }
  return direction * priceLeg(leg, iv, underlying, scenario).price;
}

export interface PositionValuation {
  modelValue: number;
  unrealizedPl: number;
  greeks: Greeks;
  flagged: boolean;
}

export function valuePosition(order: Order, scenario: Scenario): PositionValuation {
  const underlying = getUnderlying(order.underlyingSymbol);
  let modelValue = 0;
  let greeks = zeroGreeks();
  let flagged = false;

  for (const leg of order.legs) {
    const direction = leg.side === 'buy' ? 1 : -1;

    if (leg.instrument === 'stock') {
      const signedMark = markLeg(leg, 0, underlying, scenario);
      modelValue += signedMark * leg.quantity;
      greeks = addScaledGreeks(greeks, { delta: 1, gamma: 0, theta: 0, vega: 0 }, direction * leg.quantity);
      continue;
    }

    const entryQuote = findEntryQuote(leg, order.underlyingSymbol);
    if (!entryQuote) {
      flagged = true;
      const fallbackPrice = leg.quote?.mid ?? 0;
      modelValue += direction * fallbackPrice * CONTRACT_MULTIPLIER * leg.quantity;
      if (leg.quote) {
        greeks = addScaledGreeks(greeks, leg.quote.greeks, direction * leg.quantity * CONTRACT_MULTIPLIER);
      }
      continue;
    }

    const priced = priceLeg(leg, entryQuote.iv, underlying, scenario);
    const signedMark = markLeg(leg, entryQuote.iv, underlying, scenario);
    modelValue += signedMark * CONTRACT_MULTIPLIER * leg.quantity;
    greeks = addScaledGreeks(
      greeks,
      { delta: priced.delta, gamma: priced.gamma, theta: priced.theta, vega: priced.vega },
      direction * leg.quantity * CONTRACT_MULTIPLIER,
    );
  }

  const roundedModelValue = round2(modelValue);
  return {
    modelValue: roundedModelValue,
    unrealizedPl: round2(roundedModelValue - order.netPremium),
    greeks: {
      delta: round2(greeks.delta),
      gamma: round2(greeks.gamma),
      theta: round2(greeks.theta),
      vega: round2(greeks.vega),
    },
    flagged,
  };
}

export function valuePortfolio(orders: Order[], scenario: Scenario): { totalPl: number; greeks: Greeks } {
  let totalPl = 0;
  let greeks = zeroGreeks();

  for (const order of orders) {
    const valuation = valuePosition(order, scenario);
    totalPl += valuation.unrealizedPl;
    greeks = addScaledGreeks(greeks, valuation.greeks, 1);
  }

  return {
    totalPl: round2(totalPl),
    greeks: {
      delta: round2(greeks.delta),
      gamma: round2(greeks.gamma),
      theta: round2(greeks.theta),
      vega: round2(greeks.vega),
    },
  };
}

export function maxDaysForward(orders: Order[]): number {
  let min: number | undefined;
  for (const order of orders) {
    for (const leg of order.legs) {
      if (leg.instrument === 'stock' || !leg.expiration) continue;
      const dte = getExpiration(leg.expiration).daysToExpiration;
      if (min === undefined || dte < min) min = dte;
    }
  }
  return min ?? 0;
}
