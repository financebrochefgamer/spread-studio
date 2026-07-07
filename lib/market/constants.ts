import type { Expiration, Underlying } from '@/lib/types';

export const MARKET_DATE = '2026-07-06';
export const RISK_FREE_RATE = 0.04;

export const EXPIRATIONS: Expiration[] = [
  { date: '2026-08-21', label: 'Aug 21 2026', daysToExpiration: 46 },
  { date: '2026-09-18', label: 'Sep 18 2026', daysToExpiration: 74 },
  { date: '2026-10-16', label: 'Oct 16 2026', daysToExpiration: 102 },
  { date: '2026-12-18', label: 'Dec 18 2026', daysToExpiration: 165 },
];

export const UNDERLYINGS: Underlying[] = [
  { symbol: 'AURA', name: 'Aura Systems', spot: 182.4, baseVolatility: 0.28, skew: -0.18, spreadBps: 42, profile: 'large-cap growth' },
  { symbol: 'BOLT', name: 'Bolt Motors', spot: 54.2, baseVolatility: 0.46, skew: -0.24, spreadBps: 68, profile: 'event-driven single stock' },
  { symbol: 'CEDR', name: 'Cedar Retail', spot: 128.75, baseVolatility: 0.33, skew: -0.15, spreadBps: 55, profile: 'consumer cyclicals' },
  { symbol: 'DUNE', name: 'Dune Energy', spot: 419.1, baseVolatility: 0.36, skew: -0.1, spreadBps: 50, profile: 'commodity-linked equity' },
  { symbol: 'EVON', name: 'Evon Biotech', spot: 72.65, baseVolatility: 0.62, skew: -0.28, spreadBps: 85, profile: 'high-volatility biotech' },
  { symbol: 'FLCX', name: 'Flex Cloud', spot: 238.3, baseVolatility: 0.31, skew: -0.16, spreadBps: 45, profile: 'software platform' },
  { symbol: 'GRDN', name: 'Garden Foods', spot: 34.8, baseVolatility: 0.24, skew: -0.12, spreadBps: 60, profile: 'defensive dividend' },
  { symbol: 'XNDX', name: 'Northstar Index', spot: 512.6, baseVolatility: 0.21, skew: -0.22, spreadBps: 32, profile: 'index-like basket' },
];

export function getUnderlying(symbol: string): Underlying {
  const underlying = UNDERLYINGS.find((item) => item.symbol === symbol);
  if (!underlying) {
    throw new Error(`Unknown underlying: ${symbol}`);
  }
  return underlying;
}

export function getExpiration(date: string): Expiration {
  const expiration = EXPIRATIONS.find((item) => item.date === date);
  if (!expiration) {
    throw new Error(`Unknown expiration: ${date}`);
  }
  return expiration;
}
