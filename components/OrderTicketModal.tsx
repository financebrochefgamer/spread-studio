'use client';

import { Check } from 'lucide-react';
import type { Leg, Order } from '@/lib/types';
import { addOrder } from '@/lib/persist/orders';
import { track } from '@/lib/analytics/store';
import { strategyNetPremium } from '@/lib/payoff/payoff';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  open: boolean;
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  onClose: () => void;
}

function makeId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `order-${Math.random().toString(36).slice(2)}`;
}

export function OrderTicketModal({ open, underlyingSymbol, expiration, legs, onClose }: Props) {
  if (!open) return null;
  const netPremium = strategyNetPremium(legs);

  const confirm = () => {
    const order: Order = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      underlyingSymbol,
      expiration,
      legs,
      netPremium,
    };
    addOrder(order);
    track('order_placed', { underlying: underlyingSymbol, legs: legs.length, net_premium: netPremium });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-sm font-semibold">Order ticket</h2>
          <button data-testid="close-ticket" className="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-900" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{underlyingSymbol}</span>
            <span className="num font-semibold">{formatCurrency(netPremium)}</span>
          </div>
          <div className="divide-y divide-zinc-900 rounded border border-zinc-800">
            {legs.map((leg) => (
              <div key={leg.id} className="grid grid-cols-[64px_1fr_80px] gap-2 p-2 text-xs">
                <span className={leg.side === 'buy' ? 'text-sky-300' : 'text-amber-300'}>{leg.side.toUpperCase()}</span>
                <span className="text-zinc-200">
                  {leg.instrument === 'stock' ? 'Stock' : `${leg.instrument.toUpperCase()} ${formatNumber(leg.strike ?? 0, 2)}`}
                </span>
                <span className="num text-zinc-400">x{leg.quantity}</span>
              </div>
            ))}
          </div>
          <button
            data-testid="confirm-order"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-sky-400"
            onClick={confirm}
            type="button"
          >
            <Check size={16} aria-hidden="true" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
