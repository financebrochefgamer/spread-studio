import type { EventName } from '@/lib/types';

export const EVENT_NAMES: EventName[] = [
  'page_view',
  'chain_viewed',
  'template_selected',
  'leg_edited',
  'strategy_analyzed',
  'order_ticket_opened',
  'order_placed',
  'strategy_saved',
];

export const FUNNEL_STAGES = ['chain_viewed', 'strategy_built', 'strategy_analyzed', 'order_placed'] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export function isEventName(value: string): value is EventName {
  return EVENT_NAMES.includes(value as EventName);
}
