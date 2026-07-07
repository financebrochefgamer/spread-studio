import type { ChainExpiration, OptionChain, OptionQuote, OptionType, Underlying } from '@/lib/types';
import { EXPIRATIONS, RISK_FREE_RATE, UNDERLYINGS, getExpiration, getUnderlying } from '@/lib/market/constants';
import { priceOption } from '@/lib/pricing/blackScholes';

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function strikeStep(spot: number): number {
  if (spot < 50) return 2.5;
  if (spot < 150) return 5;
  if (spot < 300) return 10;
  return 25;
}

function nearestStrike(spot: number, step: number): number {
  return Math.round(spot / step) * step;
}

export function getStrikeLadder(spot: number): number[] {
  const step = strikeStep(spot);
  const atm = nearestStrike(spot, step);
  return Array.from({ length: 21 }, (_, index) => roundTo(atm + (index - 10) * step, 2)).filter((strike) => strike > 0);
}

function impliedVolatility(underlying: Underlying, strike: number, daysToExpiration: number): number {
  const moneyness = Math.log(strike / underlying.spot);
  const termLift = Math.max(0, (120 - daysToExpiration) / 365) * 0.03;
  const smile = Math.abs(moneyness) * 0.18;
  return Math.max(0.08, roundTo(underlying.baseVolatility + underlying.skew * moneyness + smile + termLift, 4));
}

function quoteFor(underlying: Underlying, expirationDate: string, strike: number, type: OptionType): OptionQuote {
  const expiration = getExpiration(expirationDate);
  const yearsToExpiration = expiration.daysToExpiration / 365;
  const iv = impliedVolatility(underlying, strike, expiration.daysToExpiration);
  const priced = priceOption({
    type,
    spot: underlying.spot,
    strike,
    yearsToExpiration,
    volatility: iv,
    riskFreeRate: RISK_FREE_RATE,
  });
  const mid = Math.max(0.01, roundTo(priced.price, 2));
  const spread = Math.max(0.02, roundTo(mid * (underlying.spreadBps / 10_000) + 0.01, 2));
  const bid = Math.max(0.01, roundTo(mid - spread / 2, 2));
  const ask = roundTo(Math.max(bid + 0.01, mid + spread / 2), 2);

  return {
    underlyingSymbol: underlying.symbol,
    expiration: expiration.date,
    strike,
    type,
    bid,
    ask,
    mid: roundTo((bid + ask) / 2, 2),
    iv,
    greeks: {
      delta: roundTo(priced.delta, 4),
      gamma: roundTo(priced.gamma, 5),
      theta: roundTo(priced.theta, 4),
      vega: roundTo(priced.vega, 4),
    },
  };
}

export function generateChain(symbol: string): OptionChain {
  const underlying = getUnderlying(symbol);
  const strikes = getStrikeLadder(underlying.spot);
  const expirations: ChainExpiration[] = EXPIRATIONS.map((expiration) => ({
    expiration,
    calls: strikes.map((strike) => quoteFor(underlying, expiration.date, strike, 'call')),
    puts: strikes.map((strike) => quoteFor(underlying, expiration.date, strike, 'put')),
  }));
  return { underlying, expirations };
}

export function getDefaultChain(): OptionChain {
  return generateChain(UNDERLYINGS[0].symbol);
}

export function findQuote(chain: OptionChain, expiration: string, type: OptionType, strike: number): OptionQuote {
  const chainExpiration = chain.expirations.find((item) => item.expiration.date === expiration);
  if (!chainExpiration) {
    throw new Error(`Expiration not found: ${expiration}`);
  }
  const quotes = type === 'call' ? chainExpiration.calls : chainExpiration.puts;
  const quote = quotes.find((item) => item.strike === strike);
  if (!quote) {
    throw new Error(`Quote not found: ${type} ${strike}`);
  }
  return quote;
}
