'use client';

import { useEffect, useMemo, useState } from 'react';
import { Nav } from '@/components/Nav';
import { PositionsTable } from '@/components/PositionsTable';
import { ScenarioControls } from '@/components/ScenarioControls';
import type { ClosedPosition, Order } from '@/lib/types';
import { readOrders } from '@/lib/persist/orders';
import { closePosition, getClosedPositions } from '@/lib/persist/closedPositions';
import { BASE_SCENARIO, type Scenario } from '@/lib/positions/scenario';
import { maxDaysForward, valuePortfolio, valuePosition } from '@/lib/positions/valuation';
import { track } from '@/lib/analytics/store';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function PositionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [closed, setClosed] = useState<ClosedPosition[]>([]);
  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);

  useEffect(() => {
    track('page_view', { path: '/positions' });
    setOrders(readOrders());
    setClosed(getClosedPositions());
  }, []);

  const closedIds = useMemo(() => new Set(closed.map((item) => item.orderId)), [closed]);
  const openOrders = useMemo(() => orders.filter((order) => !closedIds.has(order.id)), [orders, closedIds]);
  const closedOrders = useMemo(() => orders.filter((order) => closedIds.has(order.id)), [orders, closedIds]);
  const maxDays = useMemo(() => maxDaysForward(openOrders), [openOrders]);
  const portfolio = useMemo(() => valuePortfolio(openOrders, scenario), [openOrders, scenario]);

  useEffect(() => {
    // Clamp days-forward if the open-position set shrinks (e.g. after a close).
    if (scenario.daysForward > maxDays) {
      setScenario((current) => ({ ...current, daysForward: maxDays }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDays]);

  const handleClose = (order: Order) => {
    const valuation = valuePosition(order, BASE_SCENARIO);
    const record: ClosedPosition = {
      orderId: order.id,
      exitValue: valuation.modelValue,
      realizedPl: valuation.unrealizedPl,
      closedAt: new Date().toISOString(),
    };
    closePosition(record);
    setClosed(getClosedPositions());
    track('position_closed', {
      underlying: order.underlyingSymbol,
      legs: order.legs.length,
      realized_pl: valuation.unrealizedPl,
    });
  };

  const hasOpenPositions = openOrders.length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <h1 className="text-lg font-semibold">Positions</h1>

          {!hasOpenPositions ? (
            <div data-testid="positions-empty" className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-500">
              No open positions yet. Place an order from the Builder to see it here.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SummaryTile
                  label="Portfolio P&L"
                  value={formatCurrency(portfolio.totalPl)}
                  testId="portfolio-pl"
                  tone={portfolio.totalPl >= 0 ? 'profit' : 'loss'}
                />
                <SummaryTile label="Net delta" value={formatNumber(portfolio.greeks.delta, 2)} />
                <SummaryTile label="Net theta/day" value={formatNumber(portfolio.greeks.theta, 2)} />
                <SummaryTile label="Net vega/pt" value={formatNumber(portfolio.greeks.vega, 2)} />
              </div>
              <PositionsTable orders={openOrders} scenario={scenario} onClose={handleClose} />
            </>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">Closed</h2>
            <div data-testid="closed-table" className="overflow-hidden rounded border border-zinc-800">
              <table className="w-full text-xs">
                <thead className="bg-zinc-950 text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Underlying</th>
                    <th className="px-3 py-2 text-right">Entry</th>
                    <th className="px-3 py-2 text-right">Exit</th>
                    <th className="px-3 py-2 text-right">Realized P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {closedOrders.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-zinc-500" colSpan={4}>No closed positions</td>
                    </tr>
                  ) : (
                    closedOrders.map((order) => {
                      const record = closed.find((item) => item.orderId === order.id);
                      if (!record) return null;
                      return (
                        <tr key={order.id} data-testid="closed-row" className="border-t border-zinc-900">
                          <td className="px-3 py-2 font-semibold">{order.underlyingSymbol}</td>
                          <td className="num px-3 py-2">{formatCurrency(order.netPremium)}</td>
                          <td className="num px-3 py-2">{formatCurrency(record.exitValue)}</td>
                          <td className={`num px-3 py-2 ${record.realizedPl >= 0 ? 'profit' : 'loss'}`}>
                            {formatCurrency(record.realizedPl)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="space-y-3">
          {hasOpenPositions && (
            <ScenarioControls scenario={scenario} maxDaysForward={maxDays} onChange={setScenario} />
          )}
        </aside>
      </div>
    </main>
  );
}

function SummaryTile({ label, value, tone, testId }: { label: string; value: string; tone?: 'profit' | 'loss'; testId?: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div data-testid={testId} className={`num mt-1 text-sm font-semibold ${tone === 'profit' ? 'profit' : tone === 'loss' ? 'loss' : 'text-zinc-100'}`}>
        {value}
      </div>
    </div>
  );
}
