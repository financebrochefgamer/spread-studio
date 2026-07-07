import { describe, expect, it } from 'vitest';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';
import { findQuote, generateChain, getStrikeLadder } from '@/lib/chains/generate';

describe('chain generation', () => {
  it('ships 8 underlyings and 4 expirations', () => {
    expect(UNDERLYINGS).toHaveLength(8);
    expect(EXPIRATIONS).toHaveLength(4);
  });

  it('creates 21 strikes around spot', () => {
    expect(getStrikeLadder(182.4)).toHaveLength(21);
  });

  it('generates deterministic chains', () => {
    const first = generateChain('AURA');
    const second = generateChain('AURA');
    expect(first).toEqual(second);
    expect(first.expirations).toHaveLength(4);
    for (const expiration of first.expirations) {
      expect(expiration.calls).toHaveLength(21);
      expect(expiration.puts).toHaveLength(21);
      expect(expiration.calls[10].mid).toBeGreaterThan(0);
      expect(expiration.puts[10].ask).toBeGreaterThanOrEqual(expiration.puts[10].bid);
    }
  });

  it('finds a specific quote', () => {
    const chain = generateChain('BOLT');
    const strike = chain.expirations[0].calls[10].strike;
    const quote = findQuote(chain, chain.expirations[0].expiration.date, 'call', strike);
    expect(quote.underlyingSymbol).toBe('BOLT');
    expect(quote.type).toBe('call');
  });
});
