'use client';

import type { Order } from '@/lib/types';
import type { Scenario } from '@/lib/positions/scenario';
import { valuePosition } from '@/lib/positions/valuation';
import { formatCurrency } from '@/lib/format';

interface Props {
  orders: Order[];
  scenario: Scenario;
  onClose: (order: Order) => void;
}

export function PositionsTable({ orders, scenario, onClose }: Props) {
  return (
    <div data-testid="positions-table" className="overflow-hidden rounded border border-zinc-800">
      <table className="w-full text-xs">
        <thead className="bg-zinc-950 text-zinc-500">
          <tr>
            <th className="px-3 py-2 text-left">Underlying</th>
            <th className="px-3 py-2 text-right">Legs</th>
            <th className="px-3 py-2 text-right">Entry</th>
            <th className="px-3 py-2 text-right">Value</th>
            <th className="px-3 py-2 text-right">P&amp;L</th>
            <th className="px-3 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const valuation = valuePosition(order, scenario);
            return (
              <tr key={order.id} data-testid="position-row" className="border-t border-zinc-900">
                <td className="px-3 py-2 font-semibold">
                  {order.underlyingSymbol}
                  {valuation.flagged && (
                    <span className="ml-1 text-amber-400" title="A leg's entry quote could not be found; showing its entry price instead.">
                      *
                    </span>
                  )}
                </td>
                <td className="num px-3 py-2">{order.legs.length}</td>
                <td className="num px-3 py-2">{formatCurrency(order.netPremium)}</td>
                <td className="num px-3 py-2">{formatCurrency(valuation.modelValue)}</td>
                <td
                  data-testid={`position-pl-${order.id}`}
                  className={`num px-3 py-2 ${valuation.unrealizedPl >= 0 ? 'profit' : 'loss'}`}
                >
                  {formatCurrency(valuation.unrealizedPl)}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    data-testid={`close-position-${order.id}`}
                    type="button"
                    className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-sky-400"
                    onClick={() => onClose(order)}
                  >
                    Close
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
