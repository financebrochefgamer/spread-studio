'use client';

import type { Underlying } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

interface Props {
  underlyings: Underlying[];
  selected: string;
  onSelect: (symbol: string) => void;
}

export function UnderlyingPicker({ underlyings, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {underlyings.map((underlying) => {
        const active = selected === underlying.symbol;
        return (
          <button
            key={underlying.symbol}
            data-testid={`underlying-${underlying.symbol}`}
            className={`rounded border p-3 text-left transition ${
              active ? 'border-sky-400 bg-sky-950/40' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
            }`}
            onClick={() => onSelect(underlying.symbol)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-100">{underlying.symbol}</span>
              <span className="num text-xs text-zinc-300">{formatCurrency(underlying.spot)}</span>
            </div>
            <div className="mt-1 truncate text-xs text-zinc-500">{underlying.name}</div>
          </button>
        );
      })}
    </div>
  );
}
