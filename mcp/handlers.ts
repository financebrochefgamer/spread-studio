import type { AnalyticsEvent, EventName, TemplateId } from '@/lib/types';
import { aggregateFunnel, countEventsByName, templatePopularity, type FunnelCounts } from '@/lib/analytics/funnel';
import { EVENT_NAMES, FUNNEL_STAGES, type FunnelStage } from '@/lib/analytics/events';

// Pure functions only. No @modelcontextprotocol/sdk import here, so these are
// unit testable without booting a transport and reusable if the server is ever
// exposed a different way (spec FR-003, plan.md module layout).

export function getFunnelResult(events: AnalyticsEvent[]): {
  counts: FunnelCounts;
  percentOfChainViewed: Record<FunnelStage, number>;
} {
  const counts = aggregateFunnel(events);
  const percentOfChainViewed = {} as Record<FunnelStage, number>;
  for (const stage of FUNNEL_STAGES) {
    percentOfChainViewed[stage] =
      counts.chain_viewed === 0 ? 0 : Math.round((counts[stage] / counts.chain_viewed) * 1000) / 10;
  }
  return { counts, percentOfChainViewed };
}

export function getTemplatePopularityResult(
  events: AnalyticsEvent[],
  limit?: number,
): Array<{ template: TemplateId; count: number }> {
  const all = templatePopularity(events);
  return limit === undefined ? all : all.slice(0, limit);
}

export function getEventCountsResult(events: AnalyticsEvent[]): Record<EventName, number> {
  const partial = countEventsByName(events);
  const result = {} as Record<EventName, number>;
  for (const name of EVENT_NAMES) {
    result[name] = partial[name] ?? 0;
  }
  return result;
}
