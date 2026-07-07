import { describe, expect, it } from 'vitest';
import { normCdf, priceOption } from '@/lib/pricing/blackScholes';

describe('blackScholes', () => {
  it('matches published at-the-money call reference values', () => {
    const result = priceOption({
      type: 'call',
      spot: 100,
      strike: 100,
      yearsToExpiration: 1,
      volatility: 0.2,
      riskFreeRate: 0.05,
    });

    expect(result.price).toBeCloseTo(10.4506, 3);
    expect(result.delta).toBeCloseTo(0.6368, 3);
    expect(result.gamma).toBeCloseTo(0.0188, 3);
    expect(result.vega).toBeCloseTo(0.3752, 3);
    expect(result.theta).toBeCloseTo(-0.0176, 3);
  });

  it('matches published at-the-money put reference values', () => {
    const result = priceOption({
      type: 'put',
      spot: 100,
      strike: 100,
      yearsToExpiration: 1,
      volatility: 0.2,
      riskFreeRate: 0.05,
    });

    expect(result.price).toBeCloseTo(5.5735, 3);
    expect(result.delta).toBeCloseTo(-0.3632, 3);
    expect(result.gamma).toBeCloseTo(0.0188, 3);
    expect(result.vega).toBeCloseTo(0.3752, 3);
    expect(result.theta).toBeCloseTo(-0.0045, 3);
  });

  it('keeps normal CDF symmetric', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 5);
    expect(normCdf(1) + normCdf(-1)).toBeCloseTo(1, 5);
  });
});
