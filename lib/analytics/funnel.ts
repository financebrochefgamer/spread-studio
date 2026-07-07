import type { AnalyticsEvent, EventName, TemplateId } from '@/lib/types';
import type { FunnelStage } from '@/lib/analytics/events';

export type FunnelCounts = Record<FunnelStage, number>;

export function aggregateFunnel(events: AnalyticsEvent[]): FunnelCounts {
  const sessions = new Map<string, Set<EventName>>();
  for (const event of events) {
    const set = sessions.get(event.sessionId) ?? new Set<EventName>();
    set.add(event.name);
    sessions.set(event.sessionId, set);
  }

  const counts: FunnelCounts = {
    chain_viewed: 0,
    strategy_built: 0,
    strategy_analyzed: 0,
    order_placed: 0,
    position_closed: 0,
  };

  for (const set of sessions.values()) {
    if (set.has('chain_viewed')) counts.chain_viewed += 1;
    if (set.has('template_selected') || set.has('leg_edited')) counts.strategy_built += 1;
    if (set.has('strategy_analyzed')) counts.strategy_analyzed += 1;
    if (set.has('order_placed')) counts.order_placed += 1;
    if (set.has('position_closed')) counts.position_closed += 1;
  }

  return counts;
}

export function templatePopularity(events: AnalyticsEvent[]): Array<{ template: TemplateId; count: number }> {
  const counts = new Map<TemplateId, number>();
  for (const event of events) {
    if (event.name !== 'template_selected') continue;
    const template = event.properties.template as TemplateId | undefined;
    if (!template) continue;
    counts.set(template, (counts.get(template) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([template, count]) => ({ template, count }))
    .sort((a, b) => b.count - a.count || a.template.localeCompare(b.template));
}

export function countEventsByName(events: AnalyticsEvent[], sessionId?: string): Partial<Record<EventName, number>> {
  const counts: Partial<Record<EventName, number>> = {};
  for (const event of events) {
    if (sessionId && event.sessionId !== sessionId) continue;
    counts[event.name] = (counts[event.name] ?? 0) + 1;
  }
  return counts;
}
