'use client';

import type { AnalyticsEvent, EventName } from '@/lib/types';
import { isEventName } from '@/lib/analytics/events';
import { sendToAmplitude } from '@/lib/analytics/amplitude';

const EVENTS_KEY = 'spread-studio:events';
const SESSION_KEY = 'spread-studio:session-id';
const EVENT_LIMIT = 2000;

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function makeId(prefix: string): string {
  if (hasWindow() && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export function getSessionId(): string {
  if (!hasWindow()) return 'server-session';
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = makeId('session');
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return makeId('session');
  }
}

export function readLiveEvents(): AnalyticsEvent[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed.filter((event) => isEventName(event.name)) : [];
  } catch {
    return [];
  }
}

export function writeLiveEvents(events: AnalyticsEvent[]): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-EVENT_LIMIT)));
  } catch {
    // storage unavailable (e.g. private mode) - no-op
  }
}

export function track(name: EventName, properties: AnalyticsEvent['properties'] = {}): AnalyticsEvent | null {
  if (!hasWindow()) return null;
  const event: AnalyticsEvent = {
    id: makeId('event'),
    name,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    source: 'live',
    properties,
  };
  writeLiveEvents([...readLiveEvents(), event]);
  // This .catch() is the call-site half of the two-layer fire-and-forget guarantee
  // (spec 005). jsdom does not surface a live unhandled-rejection signal for this
  // specific call site, so no automated test can regress-guard it directly; do not
  // remove it on the assumption it is redundant with amplitude.ts's own handling.
  void sendToAmplitude(name, properties).catch(() => {});
  return event;
}

export function clearLiveEvents(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(EVENTS_KEY);
  } catch {
    // Storage may be blocked; clearing is best-effort.
  }
}
