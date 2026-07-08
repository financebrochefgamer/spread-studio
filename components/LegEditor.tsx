'use client';

import { Trash2 } from 'lucide-react';
import type { Leg } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  legs: Leg[];
  onUpdate: (id: string, patch: Partial<Leg>) => void;
  onRemove: (id: string) => void;
}

export function LegEditor({ legs, onUpdate, onRemove }: Props) {
  if (legs.length === 0) {
    return <div className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">No legs</div>;
  }

  return (
    <div className="space-y-2">
      {legs.map((leg, index) => (
        <div
          key={leg.id}
          data-testid={`leg-${index}`}
          className="grid grid-cols-[72px_1fr_72px_32px] items-center gap-2 rounded border border-zinc-800 bg-zinc-950 p-2 text-xs"
        >
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
            value={leg.side}
            onChange={(event) => onUpdate(leg.id, { side: event.target.value as Leg['side'] })}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <div className="min-w-0">
            <div className="truncate font-semibold uppercase text-zinc-100">
              {leg.instrument === 'stock' ? 'Stock' : `${leg.instrument} ${formatNumber(leg.strike ?? 0, 2)}`}
            </div>
            <div className="truncate text-zinc-500">
              {leg.instrument === 'stock' ? formatCurrency(leg.stockPrice ?? 0) : `${leg.expiration} · Mid ${formatCurrency(leg.quote?.mid ?? 0)}`}
            </div>
          </div>
          <input
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-right text-zinc-100"
            min={1}
            type="number"
            value={leg.quantity}
            onChange={(event) => onUpdate(leg.id, { quantity: Math.max(1, Number(event.target.value) || 1) })}
          />
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:border-rose-500 hover:text-rose-300"
            onClick={() => onRemove(leg.id)}
            title="Remove leg"
            type="button"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
