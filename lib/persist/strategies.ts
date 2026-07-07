'use client';

import type { SavedStrategy } from '@/lib/types';

const STRATEGIES_KEY = 'spread-studio:strategies';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function readStrategies(): SavedStrategy[] {
  if (!hasWindow()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STRATEGIES_KEY) ?? '[]') as SavedStrategy[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStrategies(strategies: SavedStrategy[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies));
  } catch {
    // storage unavailable (e.g. private mode) - no-op
  }
}

export function addSavedStrategy(strategy: SavedStrategy): void {
  writeStrategies([strategy, ...readStrategies()]);
}
