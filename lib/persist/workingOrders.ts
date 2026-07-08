'use client';

import type { WorkingOrder } from '@/lib/types';

const WORKING_ORDERS_KEY = 'spread-studio:working-orders';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function readWorkingOrders(): WorkingOrder[] {
  if (!hasWindow()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WORKING_ORDERS_KEY) ?? '[]') as WorkingOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWorkingOrders(orders: WorkingOrder[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(WORKING_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // storage unavailable (e.g. private mode) - no-op
  }
}

export function addWorkingOrder(order: WorkingOrder): void {
  writeWorkingOrders([order, ...readWorkingOrders()]);
}

// Returns true only when a working order genuinely transitioned to canceled, so a
// caller can gate a one-time side effect (e.g. an analytics event) on a real state
// change rather than firing it on every click, including idempotent no-ops.
export function cancelWorkingOrder(id: string): boolean {
  const orders = readWorkingOrders();
  const target = orders.find((order) => order.id === id);
  if (!target || target.status === 'canceled') return false;
  writeWorkingOrders(orders.map((order) => (order.id === id ? { ...order, status: 'canceled' } : order)));
  return true;
}
