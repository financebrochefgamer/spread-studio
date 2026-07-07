import type { Greeks, OptionType } from '@/lib/types';

export interface PriceOptionInput {
  type: OptionType;
  spot: number;
  strike: number;
  yearsToExpiration: number;
  volatility: number;
  riskFreeRate: number;
}

export interface PriceOptionResult extends Greeks {
  price: number;
}

const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

export function normPdf(x: number): number {
  return INV_SQRT_2PI * Math.exp(-0.5 * x * x);
}

export function normCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * abs);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs);
  return 0.5 * (1 + sign * erf);
}

export function priceOption(input: PriceOptionInput): PriceOptionResult {
  const { type, spot, strike, yearsToExpiration, volatility, riskFreeRate } = input;

  if (spot <= 0 || strike <= 0) {
    throw new Error('Spot and strike must be positive');
  }

  if (yearsToExpiration <= 0 || volatility <= 0) {
    const intrinsic = type === 'call' ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
    const delta = type === 'call' ? (spot > strike ? 1 : 0) : (spot < strike ? -1 : 0);
    return { price: intrinsic, delta, gamma: 0, theta: 0, vega: 0 };
  }

  const sqrtT = Math.sqrt(yearsToExpiration);
  const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * yearsToExpiration) / (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;
  const discount = Math.exp(-riskFreeRate * yearsToExpiration);

  const callPrice = spot * normCdf(d1) - strike * discount * normCdf(d2);
  const putPrice = strike * discount * normCdf(-d2) - spot * normCdf(-d1);
  const gamma = normPdf(d1) / (spot * volatility * sqrtT);
  const vega = (spot * normPdf(d1) * sqrtT) / 100;

  if (type === 'call') {
    const thetaAnnual = -(spot * normPdf(d1) * volatility) / (2 * sqrtT) - riskFreeRate * strike * discount * normCdf(d2);
    return {
      price: callPrice,
      delta: normCdf(d1),
      gamma,
      theta: thetaAnnual / 365,
      vega,
    };
  }

  const thetaAnnual = -(spot * normPdf(d1) * volatility) / (2 * sqrtT) + riskFreeRate * strike * discount * normCdf(-d2);
  return {
    price: putPrice,
    delta: normCdf(d1) - 1,
    gamma,
    theta: thetaAnnual / 365,
    vega,
  };
}
