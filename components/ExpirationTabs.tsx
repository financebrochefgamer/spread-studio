'use client';

import type { Expiration } from '@/lib/types';

interface Props {
  expirations: Expiration[];
  selected: string;
  onSelect: (date: string) => void;
}

export function ExpirationTabs({ expirations, selected, onSelect }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-800">
      {expirations.map((expiration) => {
        const active = selected === expiration.date;
        return (
          <button
            key={expiration.date}
            className={`min-w-32 border-b-2 px-3 py-2 text-left text-xs ${
              active ? 'border-sky-400 text-zinc-50' : 'border-transparent text-zinc-400 hover:text-zinc-100'
            }`}
            onClick={() => onSelect(expiration.date)}
            type="button"
          >
            <span className="block font-semibold">{expiration.label}</span>
            <span className="text-zinc-500">{expiration.daysToExpiration} DTE</span>
          </button>
        );
      })}
    </div>
  );
}
