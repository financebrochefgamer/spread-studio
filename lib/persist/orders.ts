'use client';

import type { Order } from '@/lib/types';

const ORDERS_KEY = 'spread-studio:orders';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function readOrders(): Order[] {
  if (!hasWindow()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDERS_KEY) ?? '[]') as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // storage unavailable (e.g. private mode) - no-op
  }
}

export function addOrder(order: Order): void {
  writeOrders([order, ...readOrders()]);
}
