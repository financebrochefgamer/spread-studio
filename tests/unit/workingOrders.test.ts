import { beforeEach, describe, expect, it } from 'vitest';
import type { WorkingOrder } from '@/lib/types';
import { addWorkingOrder, cancelWorkingOrder, readWorkingOrders } from '@/lib/persist/workingOrders';

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

function makeWorkingOrder(id: string): WorkingOrder {
  return {
    id,
    createdAt: '2026-07-06T14:00:00.000Z',
    underlyingSymbol: 'AURA',
    expiration: '2026-08-21',
    legs: [],
    netLimitPrice: 1.0,
    timeInForce: 'day',
    status: 'working',
  };
}

describe('lib/persist/workingOrders', () => {
  beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = { localStorage: new MemoryStorage() };
  });

  it('test 6: addWorkingOrder then readWorkingOrders round-trips the record with status working', () => {
    const order = makeWorkingOrder('wo-1');
    addWorkingOrder(order);
    const read = readWorkingOrders();
    expect(read).toHaveLength(1);
    expect(read[0]).toEqual(order);
    expect(read[0].status).toBe('working');
  });

  it('test 7: cancelWorkingOrder sets status to canceled; a second call is a no-op', () => {
    const order = makeWorkingOrder('wo-2');
    addWorkingOrder(order);

    cancelWorkingOrder('wo-2');
    expect(readWorkingOrders().find((item) => item.id === 'wo-2')?.status).toBe('canceled');

    // Idempotent: second cancel on an already-canceled order is a no-op.
    cancelWorkingOrder('wo-2');
    expect(readWorkingOrders().find((item) => item.id === 'wo-2')?.status).toBe('canceled');
    expect(readWorkingOrders()).toHaveLength(1);
  });

  it('test 8: cancelWorkingOrder on a nonexistent id is a no-op, no error, no state change', () => {
    const order = makeWorkingOrder('wo-3');
    addWorkingOrder(order);

    expect(() => cancelWorkingOrder('does-not-exist')).not.toThrow();
    expect(readWorkingOrders()).toEqual([order]);
  });
});
