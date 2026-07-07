'use client';

import { useEffect, useMemo, useState } from 'react';
import { Nav } from '@/components/Nav';
import type { AnalyticsEvent, EventName } from '@/lib/types';
import { FUNNEL_STAGES } from '@/lib/analytics/events';
import { aggregateFunnel, countEventsByName, templatePopularity } from '@/lib/analytics/funnel';
import { seededEvents } from '@/lib/analytics/seed';
import { getSessionId, readLiveEvents, track } from '@/lib/analytics/store';
import { labelFromId } from '@/lib/format';

const LIVE_EVENTS: EventName[] = [
  'page_view',
  'chain_viewed',
  'template_selected',
  'leg_edited',
  'strategy_analyzed',
  'order_ticket_opened',
  'order_placed',
  'strategy_saved',
  'scenario_adjusted',
  'position_closed',
];

export default function AnalyticsPage() {
  const [liveEvents, setLiveEvents] = useState<AnalyticsEvent[]>([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    track('page_view', { path: '/analytics' });
    setSessionId(getSessionId());
    setLiveEvents(readLiveEvents());
  }, []);

  const allEvents = useMemo(() => [...seededEvents(), ...liveEvents], [liveEvents]);
  const funnel = aggregateFunnel(allEvents);
  const popularity = templatePopularity(allEvents);
  const liveCounts = countEventsByName(liveEvents, sessionId);
  const maxFunnel = Math.max(...Object.values(funnel), 1);
  const maxPop = Math.max(...popularity.map((item) => item.count), 1);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <h1 className="text-lg font-semibold">Analytics</h1>
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-3 text-sm font-semibold">Activation funnel</h2>
            <div className="space-y-3">
              {FUNNEL_STAGES.map((stage) => (
                <div key={stage} className="grid grid-cols-[140px_1fr_52px] items-center gap-3 text-xs">
                  <span className="text-zinc-400">{labelFromId(stage)}</span>
                  <div className="h-3 rounded bg-zinc-900">
                    <div className="h-3 rounded bg-sky-400" style={{ width: `${(funnel[stage] / maxFunnel) * 100}%` }} />
                  </div>
                  <span data-testid={`funnel-stage-${stage}`} className="num text-zinc-100">{funnel[stage]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-3 text-sm font-semibold">Template popularity</h2>
            <div data-testid="template-popularity" className="space-y-2">
              {popularity.slice(0, 9).map((item) => (
                <div key={item.template} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-xs">
                  <span className="truncate text-zinc-400">{labelFromId(item.template)}</span>
                  <div className="h-3 rounded bg-zinc-900">
                    <div className="h-3 rounded bg-emerald-400" style={{ width: `${(item.count / maxPop) * 100}%` }} />
                  </div>
                  <span className="num text-zinc-100">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-3 text-sm font-semibold">Live session</h2>
          <table className="w-full text-xs">
            <tbody>
              {LIVE_EVENTS.map((name) => (
                <tr key={name} className="border-t border-zinc-900 first:border-t-0">
                  <td className="py-2 text-zinc-400">{name}</td>
                  <td data-testid={`live-${name}`} className="num py-2 text-zinc-100">
                    {liveCounts[name] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>
    </main>
  );
}
