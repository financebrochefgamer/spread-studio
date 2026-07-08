'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import type { Order, SavedStrategy, WorkingOrder } from '@/lib/types';
import { readOrders } from '@/lib/persist/orders';
import { readStrategies } from '@/lib/persist/strategies';
import { cancelWorkingOrder, readWorkingOrders } from '@/lib/persist/workingOrders';
import { useBuilder } from '@/lib/state/builder';
import { track } from '@/lib/analytics/store';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [workingOrders, setWorkingOrders] = useState<WorkingOrder[]>([]);
  const loadStrategy = useBuilder((state) => state.loadStrategy);
  const router = useRouter();

  useEffect(() => {
    track('page_view', { path: '/orders' });
    setOrders(readOrders());
    setStrategies(readStrategies());
    setWorkingOrders(readWorkingOrders());
  }, []);

  const cancelWorking = (order: WorkingOrder) => {
    const canceled = cancelWorkingOrder(order.id);
    if (canceled) {
      track('working_order_canceled', { underlying: order.underlyingSymbol, legs: order.legs.length });
    }
    setWorkingOrders(readWorkingOrders());
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h1 className="text-lg font-semibold">Orders</h1>
          <div className="overflow-hidden rounded border border-zinc-800">
            <table className="w-full text-xs">
              <thead className="bg-zinc-950 text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Underlying</th>
                  <th className="px-3 py-2 text-right">Legs</th>
                  <th className="px-3 py-2 text-right">Net</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">TIF</th>
                  <th className="px-3 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-zinc-500" colSpan={6}>No orders</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} data-testid="order-row" className="border-t border-zinc-900">
                      <td className="px-3 py-2 font-semibold">{order.underlyingSymbol}</td>
                      <td className="num px-3 py-2">{order.legs.length}</td>
                      <td className="num px-3 py-2">{formatCurrency(order.netPremium)}</td>
                      <td className="px-3 py-2 text-zinc-500 capitalize">{order.orderType ?? 'market'}</td>
                      <td className="px-3 py-2 text-zinc-500 uppercase">{order.timeInForce ?? 'day'}</td>
                      <td className="px-3 py-2 text-zinc-500">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Saved</h2>
          <div className="space-y-2">
            {strategies.length === 0 ? (
              <div className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">No saved strategies</div>
            ) : (
              strategies.map((saved, index) => (
                <button
                  key={saved.id}
                  data-testid={`strategy-load-${index}`}
                  className="grid w-full grid-cols-[1fr_80px] rounded border border-zinc-800 bg-zinc-950 p-3 text-left text-sm hover:border-sky-400"
                  onClick={() => {
                    loadStrategy(saved.strategy);
                    router.push('/');
                  }}
                  type="button"
                >
                  <span>
                    <span className="block font-semibold text-zinc-100">{saved.name}</span>
                    <span className="text-xs text-zinc-500">{saved.strategy.underlyingSymbol}</span>
                  </span>
                  <span className="num text-xs text-zinc-400">{formatNumber(saved.strategy.legs.length, 0)} legs</span>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="p-4 pt-0">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Working Orders</h2>
          <div className="overflow-hidden rounded border border-zinc-800">
            <table className="w-full text-xs">
              <thead className="bg-zinc-950 text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Underlying</th>
                  <th className="px-3 py-2 text-right">Legs</th>
                  <th className="px-3 py-2 text-right">Limit</th>
                  <th className="px-3 py-2 text-left">TIF</th>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {workingOrders.filter((order) => order.status === 'working').length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-zinc-500" colSpan={6}>No working orders</td>
                  </tr>
                ) : (
                  workingOrders
                    .filter((order) => order.status === 'working')
                    .map((order) => (
                      <tr key={order.id} data-testid="working-order-row" className="border-t border-zinc-900">
                        <td className="px-3 py-2 font-semibold">{order.underlyingSymbol}</td>
                        <td className="num px-3 py-2">{order.legs.length}</td>
                        <td className="num px-3 py-2">{formatCurrency(order.netLimitPrice)}</td>
                        <td className="px-3 py-2 text-zinc-500 uppercase">{order.timeInForce}</td>
                        <td className="px-3 py-2 text-zinc-500">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            data-testid="cancel-working-order"
                            className="rounded border border-zinc-700 px-2 py-1 text-zinc-300 hover:border-red-400 hover:text-red-300"
                            onClick={() => cancelWorking(order)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
