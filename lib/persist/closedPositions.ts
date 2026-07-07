'use client';

import type { ClosedPosition } from '@/lib/types';

const CLOSED_POSITIONS_KEY = 'spread-studio:closed-positions';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function getClosedPositions(): ClosedPosition[] {
  if (!hasWindow()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CLOSED_POSITIONS_KEY) ?? '[]') as ClosedPosition[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeClosedPositions(records: ClosedPosition[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(CLOSED_POSITIONS_KEY, JSON.stringify(records));
  } catch {
    // storage unavailable (e.g. private mode) - no-op
  }
}

export function closePosition(record: ClosedPosition): void {
  const existing = getClosedPositions();
  if (existing.some((item) => item.orderId === record.orderId)) return;
  writeClosedPositions([record, ...existing]);
}
