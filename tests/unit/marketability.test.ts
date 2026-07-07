import { describe, expect, it } from 'vitest';
import { isMarketable } from '@/lib/orders/marketability';

describe('lib/orders/marketability', () => {
  it('debit over-bid fills: netMid=1.50, netLimitPrice=2.00 is marketable', () => {
    expect(isMarketable(1.5, 2.0)).toBe(true);
  });

  it('debit under-bid does not fill: netMid=1.50, netLimitPrice=1.00 is not marketable', () => {
    expect(isMarketable(1.5, 1.0)).toBe(false);
  });

  it('credit market-better-than-minimum fills: netMid=-1.00, netLimitPrice=-0.80 is marketable', () => {
    expect(isMarketable(-1.0, -0.8)).toBe(true);
  });

  it('credit market-worse-than-minimum does not fill: netMid=-1.00, netLimitPrice=-1.20 is not marketable', () => {
    expect(isMarketable(-1.0, -1.2)).toBe(false);
  });

  it('exact boundary: netMid === netLimitPrice is marketable (per <=)', () => {
    expect(isMarketable(1.5, 1.5)).toBe(true);
    expect(isMarketable(-1.0, -1.0)).toBe(true);
  });
});
