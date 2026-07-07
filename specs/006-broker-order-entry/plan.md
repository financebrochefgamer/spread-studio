# Implementation Plan: Broker-Grade Order Entry

**Branch**: `006-order-entry-implementation` | **Spec**: specs/006-broker-order-entry/spec.md | **Date**: 2026-07-08

## Summary

Order type (market/limit) with a single correctly-signed marketability rule, a
working-orders persistence layer, pre-trade risk warnings computed from data the
builder already has, and a captured time-in-force field. All logic lives in pure,
unit-tested functions; `OrderTicketModal` and `AnalysisPanel` wire them together.

## Verified starting point (checked against real source, not assumed)

- `AnalysisPanel` (components/AnalysisPanel.tsx:29) already computes
  `analyzeStrategy({ underlyingSymbol, expiration, legs, templateId })` via
  `useMemo` and holds the result as `analysis`. `OrderTicketModal` does NOT receive
  it today; it only gets `underlyingSymbol`, `expiration`, `legs`, `open`, `onClose`
  (OrderTicketModal.tsx:11-17) and calls `strategyNetPremium(legs)` itself
  (line 32). The correct fix is threading `AnalysisPanel`'s already-computed
  `analysis: AnalysisResult` down as a new prop, not calling `analyzeStrategy` a
  second time.
- `Order` (lib/types.ts:107-114): `{ id, createdAt, underlyingSymbol, expiration,
  legs, netPremium }`. Gains optional `timeInForce?: 'day' | 'gtc'` and
  `orderType?: 'market' | 'limit'`.
- `lib/persist/orders.ts` pattern to mirror exactly for the new working-orders
  store: `hasWindow()` guard, try/catch on both read and write, JSON array, one
  localStorage key.
- `AnalysisResult` (lib/types.ts:97-105) has `maxProfit: number | 'Unlimited'`,
  `maxLoss: number | 'Unlimited'`, `netPremium`, plus `legGreeks: Array<{ legId:
  string; greeks: Greeks }>` for per-leg iteration, but NOT per-leg quotes directly;
  wide-spread checking needs each leg's `OptionQuote` (`bid`/`ask`/`mid`), which
  lives on `Leg.quote` (lib/types.ts:81), not on the analysis result. Iterate
  `legs` directly for the wide-spread check, not `analysis.legGreeks`.
- `lib/chains/generate.ts:47-49`: `spread = max(0.02, mid * spreadBps/10000 +
  0.01)`, `bid = max(0.01, mid - spread/2)`, `ask = max(bid + 0.01, mid +
  spread/2)`. The wide-spread check re-derives the ratio from the quote's own
  `bid`/`ask`/`mid` fields already on `Leg.quote`; it does not need to re-run this
  formula, just read the stored values.

## Module layout

- `lib/orders/marketability.ts` (new, pure):
  ```ts
  export function isMarketable(netMid: number, netLimitPrice: number): boolean {
    return netMid <= netLimitPrice;
  }
  ```
  One function, matches the spec's single unified rule exactly. No debit/credit
  branch.
- `lib/orders/riskWarnings.ts` (new, pure):
  ```ts
  export interface RiskWarning { kind: 'unlimited_risk' | 'wide_spread' | 'complex_order'; legId?: string }

  const WIDE_SPREAD_RATIO = 0.08;

  export function getRiskWarnings(legs: Leg[], analysis: AnalysisResult): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    if (analysis.maxLoss === 'Unlimited' || analysis.maxProfit === 'Unlimited') {
      warnings.push({ kind: 'unlimited_risk' });
    }
    for (const leg of legs) {
      const quote = leg.quote;
      if (!quote || quote.mid <= 0) continue;
      if ((quote.ask - quote.bid) / quote.mid > WIDE_SPREAD_RATIO) {
        warnings.push({ kind: 'wide_spread', legId: leg.id });
      }
    }
    if (legs.length > 4) warnings.push({ kind: 'complex_order' });
    return warnings;
  }
  ```
- `lib/persist/workingOrders.ts` (new), mirroring lib/persist/orders.ts exactly:
  ```ts
  const WORKING_ORDERS_KEY = 'spread-studio:working-orders';
  // hasWindow(), readWorkingOrders(): WorkingOrder[], writeWorkingOrders(orders), addWorkingOrder(order), cancelWorkingOrder(id): void
  ```
  `cancelWorkingOrder` sets `status: 'canceled'` in place rather than removing the
  record (so a canceled order stays visible with its status, matching how a real
  platform shows canceled orders in history rather than deleting them). The Orders
  page's "Working Orders" section filters to `status === 'working'` for the active
  list; a canceled order simply stops appearing there. Idempotent: canceling a
  record already `'canceled'`, or one not found at all, is a no-op that touches no
  state and fires no event, per spec User Story 1 and FR-005.
- `lib/types.ts`: add `WorkingOrder` interface per spec FR-001 (id, createdAt,
  underlyingSymbol, expiration, legs, netLimitPrice, timeInForce, status), add
  optional `timeInForce?`/`orderType?` to `Order`.
- Two files, both required (verified as the real split): `lib/types.ts:16-26` add
  `'working_order_placed'` and `'working_order_canceled'` to the `EventName` union
  type; `lib/analytics/events.ts:3-13` add both strings to the `EVENT_NAMES` array
  (12 entries total after this change). `isEventName`'s behavior is unaffected
  (already generic over the array).
- `components/OrderTicketModal.tsx` changes:
  - New props: `analysis: AnalysisResult` (from the caller, per the verified
    starting point above), nothing else added to the prop surface.
  - New local state: `orderType: 'market' | 'limit'` (default `'market'`),
    `limitPriceInput: string` (raw text input, parsed on submit), `timeInForce:
    'day' | 'gtc'` (default `'day'`; plan picks Day as the default because it
    matches a typical retail-platform default and needs no special handling since
    TIF lifecycle is out of scope either way).
  - Risk warnings computed via `getRiskWarnings(legs, analysis)`, rendered above
    the confirm button, informational only (never disables confirm).
  - `confirm()` branches: if `orderType === 'market'`, unchanged existing behavior
    plus the new optional fields set (`orderType: 'market'`, `timeInForce`) on the
    `Order`. If `orderType === 'limit'`, compute `isMarketable(netMid,
    parsedLimitPrice)`; if true, same fill path as market (fills at `netMid`, per
    spec, NOT at the limit) with `orderType: 'limit'` recorded; if false, build a
    `WorkingOrder` via `addWorkingOrder`, fire `working_order_placed` (not
    `order_placed`), and close the ticket without creating a position.
- `app/orders/page.tsx`: new full-width section below the existing two-column
  grid, "Working Orders", listing `readWorkingOrders().filter(w => w.status ===
  'working')` with underlying, legs, limit price, time in force, and a Cancel
  button (`data-testid="cancel-working-order"`) that calls
  `cancelWorkingOrder(id)`, fires `working_order_canceled`, and re-reads the list.

## Testids (new, e2e contract)

`order-type-market`, `order-type-limit`, `limit-price-input`, `time-in-force-day`,
`time-in-force-gtc`, `risk-warning-unlimited`, `risk-warning-wide-spread`,
`risk-warning-complex`, `working-order-row`, `cancel-working-order`.

## Constitution check

All new logic is pure and deterministic (no clock reads beyond the existing
`createdAt` timestamp pattern already used by `Order`, no randomness beyond the
existing `makeId()` pattern). Guarded localStorage matching the existing pattern.
Two new analytics events added to docs/product/success-metrics.md in the spec PR
already merged; no further taxonomy changes needed. Spec approved in PR #8 after two
review rounds (two Blocking findings on the marketability rule and fill price,
corrected) before this plan.

## Tests

Unit (tests/unit/marketability.test.ts):
1. `isMarketable`: the four worked scenarios from the spec, verbatim (debit
   over-bid fills, debit under-bid does not, credit-market-better-than-minimum
   fills, credit-market-worse-than-minimum does not), plus the exact boundary
   (`netMid === netLimitPrice` fills, per `<=`).

Unit (tests/unit/riskWarnings.test.ts):
2. Iron condor (defined risk) with liquid legs produces zero warnings (SC-2's
   negative case).
3. A naked short call (`maxLoss === 'Unlimited'`) produces the `unlimited_risk`
   warning (SC-2's positive case), using `analyzeStrategy` for real, not a mocked
   analysis object, so the test also proves the real payoff engine's sentinel is
   read correctly.
4. A leg built from a real generated chain quote with mid under $0.25 (per the
   spec's documented price-level mechanism) produces the `wide_spread` warning
   naming that leg's id; a normal liquid ATM leg from the same chain does not.
5. Exactly 4 legs: no `complex_order` warning. Exactly 5 legs: the warning fires.

Unit (tests/unit/workingOrders.test.ts):
6. `addWorkingOrder` then `readWorkingOrders` round-trips the record with
   `status: 'working'`.
7. `cancelWorkingOrder` sets status to `'canceled'`; a second call on the same id
   is a no-op (status remains `'canceled'`, no error).
8. `cancelWorkingOrder` on a nonexistent id is a no-op, no error, no state change.

Playwright (extend tests/e2e/journey.spec.ts or a new tests/e2e/order-entry.spec.ts):
9. Build a strategy, open the ticket, switch to Limit, enter a limit price that
   makes it non-marketable (e.g. a debit strategy with a limit far below net mid),
   confirm, verify no position/order was created, verify it appears in Working
   Orders on /orders, cancel it, verify it no longer appears in the active working
   list.
10. Build the same strategy, enter a limit price that IS marketable (e.g. at or
    above net mid for a debit), confirm, verify it fills and appears in Orders
    exactly like a market order would.
11. Build a naked short call or other unlimited-risk single-leg strategy, open the
    ticket, verify the unlimited-risk warning renders, confirm anyway (warnings are
    non-blocking per spec), verify the order still places successfully.

## Notes from spec review (must implement)

1. The marketability rule is exactly `netMid <= netLimitPrice`, one function, no
   debit/credit branch. Do not reintroduce a split; that was the exact bug two
   review rounds caught.
2. A marketable order of either type always fills at `netMid`, never at the
   trader's entered limit price.
3. `netLimitPrice` is signed exactly like `netPremium`; do not reject zero or
   negative values as invalid input, only non-numeric ones.
