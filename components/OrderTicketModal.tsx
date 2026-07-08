'use client';

import { useEffect, useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import type { AnalysisResult, Leg, Order, WorkingOrder } from '@/lib/types';
import { addOrder } from '@/lib/persist/orders';
import { addWorkingOrder } from '@/lib/persist/workingOrders';
import { track } from '@/lib/analytics/store';
import { strategyNetPremium } from '@/lib/payoff/payoff';
import { isMarketable } from '@/lib/orders/marketability';
import { getRiskWarnings } from '@/lib/orders/riskWarnings';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  open: boolean;
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  analysis: AnalysisResult;
  onClose: () => void;
}

type OrderType = 'market' | 'limit';
type TimeInForce = 'day' | 'gtc';

function makeId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `order-${Math.random().toString(36).slice(2)}`;
}

// Human-readable leg description for user-facing text (e.g. risk warnings).
// Never surface a leg's internal id directly to the trader.
function describeLeg(leg: Leg): string {
  if (leg.instrument === 'stock') return 'Stock';
  const kind = leg.instrument === 'call' ? 'Call' : 'Put';
  return `${formatNumber(leg.strike ?? 0, 2)} ${kind}`;
}

export function OrderTicketModal({ open, underlyingSymbol, expiration, legs, analysis, onClose }: Props) {
  const [placed, setPlaced] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('day');

  useEffect(() => {
    if (open) {
      setPlaced(false);
      setOrderType('market');
      setLimitPriceInput('');
      setTimeInForce('day');
    }
  }, [open]);

  if (!open) return null;
  const netMid = strategyNetPremium(legs);
  const parsedLimitPrice = limitPriceInput.trim() === '' ? NaN : Number(limitPriceInput);
  const hasValidLimitPrice = Number.isFinite(parsedLimitPrice);
  const warnings = getRiskWarnings(legs, analysis);
  const unlimitedWarning = warnings.find((warning) => warning.kind === 'unlimited_risk');
  const wideSpreadWarnings = warnings.filter((warning) => warning.kind === 'wide_spread');
  const complexWarning = warnings.find((warning) => warning.kind === 'complex_order');

  const canConfirm = !placed && (orderType === 'market' || hasValidLimitPrice);

  const confirm = () => {
    if (!canConfirm) return;

    if (orderType === 'limit' && !isMarketable(netMid, parsedLimitPrice)) {
      const workingOrder: WorkingOrder = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        underlyingSymbol,
        expiration,
        legs,
        netLimitPrice: parsedLimitPrice,
        timeInForce,
        status: 'working',
      };
      addWorkingOrder(workingOrder);
      track('working_order_placed', { underlying: underlyingSymbol, legs: legs.length, net_limit_price: parsedLimitPrice });
      onClose();
      return;
    }

    // Market order, or a marketable limit: fills now at netMid, never at the trader's limit.
    const order: Order = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      underlyingSymbol,
      expiration,
      legs,
      netPremium: netMid,
      orderType,
      timeInForce,
    };
    addOrder(order);
    track('order_placed', { underlying: underlyingSymbol, legs: legs.length, net_premium: netMid });
    setPlaced(true);
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
            <span className="num font-semibold">{formatCurrency(netMid)}</span>
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

          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-500">Order type</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                data-testid="order-type-market"
                className={
                  orderType === 'market'
                    ? 'rounded border border-sky-400 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300'
                    : 'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500'
                }
                onClick={() => setOrderType('market')}
                disabled={placed}
                type="button"
              >
                Market
              </button>
              <button
                data-testid="order-type-limit"
                className={
                  orderType === 'limit'
                    ? 'rounded border border-sky-400 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300'
                    : 'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500'
                }
                onClick={() => setOrderType('limit')}
                disabled={placed}
                type="button"
              >
                Limit
              </button>
            </div>
          </div>

          {orderType === 'limit' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500" htmlFor="limit-price-input">
                Net limit price (debit positive, credit negative)
              </label>
              <input
                id="limit-price-input"
                data-testid="limit-price-input"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 num"
                type="number"
                step="0.01"
                value={limitPriceInput}
                onChange={(event) => setLimitPriceInput(event.target.value)}
                disabled={placed}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-500">Time in force</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                data-testid="time-in-force-day"
                className={
                  timeInForce === 'day'
                    ? 'rounded border border-sky-400 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300'
                    : 'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500'
                }
                onClick={() => setTimeInForce('day')}
                disabled={placed}
                type="button"
              >
                Day
              </button>
              <button
                data-testid="time-in-force-gtc"
                className={
                  timeInForce === 'gtc'
                    ? 'rounded border border-sky-400 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300'
                    : 'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500'
                }
                onClick={() => setTimeInForce('gtc')}
                disabled={placed}
                title="Good-Til-Canceled"
                type="button"
              >
                GTC
              </button>
            </div>
          </div>

          {(unlimitedWarning || wideSpreadWarnings.length > 0 || complexWarning) && (
            <div className="space-y-2">
              {unlimitedWarning && (
                <div data-testid="risk-warning-unlimited" className="flex items-start gap-2 rounded border border-amber-700 bg-amber-950/40 p-2 text-xs text-amber-300">
                  <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>Unlimited risk: this strategy&apos;s max profit or max loss is unbounded.</span>
                </div>
              )}
              {wideSpreadWarnings.length > 0 && (
                <div data-testid="risk-warning-wide-spread" className="flex items-start gap-2 rounded border border-amber-700 bg-amber-950/40 p-2 text-xs text-amber-300">
                  <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    Wide spread on leg(s):{' '}
                    {wideSpreadWarnings
                      .map((warning) => {
                        const leg = legs.find((candidate) => candidate.id === warning.legId);
                        return leg ? describeLeg(leg) : warning.legId;
                      })
                      .join(', ')}
                    .
                  </span>
                </div>
              )}
              {complexWarning && (
                <div data-testid="risk-warning-complex" className="flex items-start gap-2 rounded border border-amber-700 bg-amber-950/40 p-2 text-xs text-amber-300">
                  <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>Complex order: this strategy has more than 4 legs.</span>
                </div>
              )}
            </div>
          )}

          <button
            data-testid="confirm-order"
            className={
              placed
                ? 'inline-flex w-full cursor-default items-center justify-center gap-2 rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-zinc-950'
                : 'inline-flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50'
            }
            onClick={confirm}
            disabled={!canConfirm}
            type="button"
          >
            <Check size={16} aria-hidden="true" />
            {placed ? 'Order placed' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
