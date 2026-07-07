'use client';

import { Save, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Leg, TemplateId } from '@/lib/types';
import { analyzeStrategy } from '@/lib/payoff/payoff';
import { addSavedStrategy } from '@/lib/persist/strategies';
import { track } from '@/lib/analytics/store';
import { labelFromId } from '@/lib/format';
import { MetricsGrid } from '@/components/MetricsGrid';
import { GreeksTable } from '@/components/GreeksTable';
import { PayoffChart } from '@/components/PayoffChart';
import { OrderTicketModal } from '@/components/OrderTicketModal';

interface Props {
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  templateId?: TemplateId;
}

function makeId(prefix: string): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export function AnalysisPanel({ underlyingSymbol, expiration, legs, templateId }: Props) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const analysis = useMemo(() => analyzeStrategy({ underlyingSymbol, expiration, legs, templateId }), [underlyingSymbol, expiration, legs, templateId]);
  const hasLegs = legs.length > 0;

  useEffect(() => {
    if (!hasLegs) return;
    const timer = window.setTimeout(() => {
      track('strategy_analyzed', { underlying: underlyingSymbol, legs: legs.length, template: templateId });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [hasLegs, underlyingSymbol, legs.length, templateId]);

  const openTicket = () => {
    track('order_ticket_opened', { underlying: underlyingSymbol, legs: legs.length });
    setTicketOpen(true);
  };

  const saveStrategy = () => {
    addSavedStrategy({
      id: makeId('strategy'),
      createdAt: new Date().toISOString(),
      name: templateId ? labelFromId(templateId) : `${underlyingSymbol} custom`,
      strategy: { underlyingSymbol, expiration, legs, templateId },
    });
    track('strategy_saved', { underlying: underlyingSymbol, legs: legs.length });
  };

  if (!hasLegs) {
    return <div className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">Analysis waits for the first leg.</div>;
  }

  return (
    <section className="space-y-3">
      <MetricsGrid analysis={analysis} />
      <PayoffChart analysis={analysis} />
      <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
        <GreeksTable analysis={analysis} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          data-testid="save-strategy"
          className="inline-flex items-center justify-center gap-2 rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-sky-400"
          onClick={saveStrategy}
          type="button"
        >
          <Save size={15} aria-hidden="true" />
          Save
        </button>
        <button
          data-testid="open-ticket"
          className="inline-flex items-center justify-center gap-2 rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-sky-400"
          onClick={openTicket}
          type="button"
        >
          <Ticket size={15} aria-hidden="true" />
          Ticket
        </button>
      </div>
      <OrderTicketModal
        open={ticketOpen}
        underlyingSymbol={underlyingSymbol}
        expiration={expiration}
        legs={legs}
        analysis={analysis}
        onClose={() => setTicketOpen(false)}
      />
    </section>
  );
}
