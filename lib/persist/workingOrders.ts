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

export function cancelWorkingOrder(id: string): void {
  const orders = readWorkingOrders();
  const target = orders.find((order) => order.id === id);
  if (!target || target.status === 'canceled') return;
  writeWorkingOrders(orders.map((order) => (order.id === id ? { ...order, status: 'canceled' } : order)));
}
