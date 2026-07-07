import type { AnalysisResult, Greeks, Leg, PayoffPoint, Strategy } from '@/lib/types';
import { getUnderlying } from '@/lib/market/constants';

const CONTRACT_MULTIPLIER = 100;

function round2(value: number): number {
  if (!Number.isFinite(value)) return value;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function signedQuantity(leg: Leg): number {
  return leg.side === 'buy' ? leg.quantity : -leg.quantity;
}

export function legNetPremium(leg: Leg): number {
  if (leg.instrument === 'stock') {
    const price = leg.stockPrice ?? 0;
    return (leg.side === 'buy' ? 1 : -1) * price * leg.quantity;
  }
  const premium = leg.quote?.mid ?? 0;
  return (leg.side === 'buy' ? 1 : -1) * premium * CONTRACT_MULTIPLIER * leg.quantity;
}

export function strategyNetPremium(legs: Leg[]): number {
  return round2(legs.reduce((sum, leg) => sum + legNetPremium(leg), 0));
}

export function legPayoffAtExpiration(leg: Leg, underlyingPrice: number): number {
  if (leg.instrument === 'stock') {
    const entry = leg.stockPrice ?? 0;
    const direction = leg.side === 'buy' ? 1 : -1;
    return direction * (underlyingPrice - entry) * leg.quantity;
  }

  const strike = leg.strike ?? leg.quote?.strike ?? 0;
  const premium = leg.quote?.mid ?? 0;
  const intrinsic = leg.instrument === 'call'
    ? Math.max(0, underlyingPrice - strike)
    : Math.max(0, strike - underlyingPrice);
  const perShare = leg.side === 'buy' ? intrinsic - premium : premium - intrinsic;
  return perShare * CONTRACT_MULTIPLIER * leg.quantity;
}

export function strategyPayoffAtExpiration(legs: Leg[], underlyingPrice: number): number {
  return round2(legs.reduce((sum, leg) => sum + legPayoffAtExpiration(leg, underlyingPrice), 0));
}

function highPriceSlope(legs: Leg[]): number {
  return legs.reduce((sum, leg) => {
    if (leg.instrument === 'call') return sum + signedQuantity(leg) * CONTRACT_MULTIPLIER;
    if (leg.instrument === 'stock') return sum + signedQuantity(leg);
    return sum;
  }, 0);
}

function priceRange(spot: number, legs: Leg[]): number[] {
  const strikes = legs.map((leg) => leg.strike).filter((value): value is number => typeof value === 'number');
  const min = Math.max(0, Math.min(spot * 0.5, ...strikes.map((strike) => strike * 0.8)));
  const max = Math.max(spot * 1.5, ...strikes.map((strike) => strike * 1.2));
  const step = (max - min) / 80;
  const points = Array.from({ length: 81 }, (_, index) => round2(min + step * index));
  return Array.from(new Set([...points, ...strikes, 0].filter((value) => value >= 0))).sort((a, b) => a - b);
}

function breakevens(points: PayoffPoint[]): number[] {
  const breaks: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const curr = points[index];
    if (prev.profitLoss === 0) {
      breaks.push(prev.underlyingPrice);
      continue;
    }
    if ((prev.profitLoss < 0 && curr.profitLoss > 0) || (prev.profitLoss > 0 && curr.profitLoss < 0)) {
      const distance = curr.underlyingPrice - prev.underlyingPrice;
      const ratio = Math.abs(prev.profitLoss) / (Math.abs(prev.profitLoss) + Math.abs(curr.profitLoss));
      breaks.push(round2(prev.underlyingPrice + distance * ratio));
    }
  }
  return Array.from(new Set(breaks)).sort((a, b) => a - b);
}

function zeroGreeks(): Greeks {
  return { delta: 0, gamma: 0, theta: 0, vega: 0 };
}

function legGreeks(leg: Leg): Greeks {
  if (leg.instrument === 'stock') {
    return {
      delta: (leg.side === 'buy' ? 1 : -1) * leg.quantity,
      gamma: 0,
      theta: 0,
      vega: 0,
    };
  }
  const direction = leg.side === 'buy' ? 1 : -1;
  const greeks = leg.quote?.greeks ?? zeroGreeks();
  return {
    delta: greeks.delta * direction * leg.quantity,
    gamma: greeks.gamma * direction * leg.quantity,
    theta: greeks.theta * direction * leg.quantity,
    vega: greeks.vega * direction * leg.quantity,
  };
}

function addGreeks(a: Greeks, b: Greeks): Greeks {
  return {
    delta: a.delta + b.delta,
    gamma: a.gamma + b.gamma,
    theta: a.theta + b.theta,
    vega: a.vega + b.vega,
  };
}

export function analyzeStrategy(strategy: Strategy): AnalysisResult {
  const underlying = getUnderlying(strategy.underlyingSymbol);
  const range = priceRange(underlying.spot, strategy.legs);
  const payoff = range.map((underlyingPrice) => ({
    underlyingPrice,
    profitLoss: strategyPayoffAtExpiration(strategy.legs, underlyingPrice),
  }));
  const values = payoff.map((point) => point.profitLoss);
  const slope = highPriceSlope(strategy.legs);
  const maxProfit = slope > 0 ? 'Unlimited' : round2(Math.max(...values));
  const maxLoss = slope < 0 ? 'Unlimited' : round2(Math.min(...values));
  const perLegGreeks = strategy.legs.map((leg) => ({ legId: leg.id, greeks: legGreeks(leg) }));
  const greeks = perLegGreeks.reduce((sum, item) => addGreeks(sum, item.greeks), zeroGreeks());

  return {
    payoff,
    breakevens: breakevens(payoff),
    maxProfit,
    maxLoss,
    netPremium: strategyNetPremium(strategy.legs),
    greeks: {
      delta: round2(greeks.delta),
      gamma: round2(greeks.gamma),
      theta: round2(greeks.theta),
      vega: round2(greeks.vega),
    },
    legGreeks: perLegGreeks,
  };
}
