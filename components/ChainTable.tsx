'use client';

import { Plus } from 'lucide-react';
import type { ChainExpiration, Leg, OptionQuote } from '@/lib/types';
import { formatNumber, formatPercent } from '@/lib/format';

interface Props {
  chainExpiration: ChainExpiration;
  onAddLeg: (leg: Leg) => void;
}

function idFor(quote: OptionQuote, side: 'buy' | 'sell'): string {
  return `custom-${quote.type}-${quote.strike}-${side}`;
}

function legFromQuote(quote: OptionQuote, side: 'buy' | 'sell'): Leg {
  return {
    id: idFor(quote, side),
    instrument: quote.type,
    side,
    quantity: 1,
    strike: quote.strike,
    expiration: quote.expiration,
    quote,
  };
}

export function ChainTable({ chainExpiration, onAddLeg }: Props) {
  return (
    <div className="overflow-hidden rounded border border-zinc-800">
      <table data-testid="chain-table" className="w-full table-fixed border-collapse text-xs">
        <thead className="bg-zinc-950 text-zinc-500">
          <tr>
            <th className="px-2 py-2 text-right">Call bid</th>
            <th className="px-2 py-2 text-right">Call ask</th>
            <th className="px-2 py-2 text-right">Delta</th>
            <th className="px-2 py-2 text-center">Strike</th>
            <th className="px-2 py-2 text-right">Put bid</th>
            <th className="px-2 py-2 text-right">Put ask</th>
            <th className="px-2 py-2 text-right">IV</th>
          </tr>
        </thead>
        <tbody>
          {chainExpiration.calls.map((call, index) => {
            const put = chainExpiration.puts[index];
            return (
              <tr key={call.strike} className="border-t border-zinc-900 hover:bg-zinc-900/60">
                <td className="num px-2 py-1.5">
                  <button
                    data-testid={`add-call-${call.strike}-sell`}
                    title="Sell call"
                    className="rounded px-1.5 py-1 text-zinc-200 hover:bg-zinc-800"
                    onClick={() => onAddLeg(legFromQuote(call, 'sell'))}
                    type="button"
                  >
                    {formatNumber(call.bid)}
                  </button>
                </td>
                <td className="num px-2 py-1.5">
                  <button
                    data-testid={`add-call-${call.strike}-buy`}
                    title="Buy call"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-zinc-200 hover:bg-zinc-800"
                    onClick={() => onAddLeg(legFromQuote(call, 'buy'))}
                    type="button"
                  >
                    <Plus size={12} aria-hidden="true" />
                    {formatNumber(call.ask)}
                  </button>
                </td>
                <td className="num px-2 py-1.5 text-zinc-400">{formatNumber(call.greeks.delta, 2)}</td>
                <td className="px-2 py-1.5 text-center font-semibold text-zinc-100">{formatNumber(call.strike, 2)}</td>
                <td className="num px-2 py-1.5">
                  <button
                    data-testid={`add-put-${put.strike}-sell`}
                    title="Sell put"
                    className="rounded px-1.5 py-1 text-zinc-200 hover:bg-zinc-800"
                    onClick={() => onAddLeg(legFromQuote(put, 'sell'))}
                    type="button"
                  >
                    {formatNumber(put.bid)}
                  </button>
                </td>
                <td className="num px-2 py-1.5">
                  <button
                    data-testid={`add-put-${put.strike}-buy`}
                    title="Buy put"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-zinc-200 hover:bg-zinc-800"
                    onClick={() => onAddLeg(legFromQuote(put, 'buy'))}
                    type="button"
                  >
                    <Plus size={12} aria-hidden="true" />
                    {formatNumber(put.ask)}
                  </button>
                </td>
                <td className="num px-2 py-1.5 text-zinc-400">{formatPercent(put.iv)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
