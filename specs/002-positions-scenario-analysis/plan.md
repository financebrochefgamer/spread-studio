# Implementation Plan: Positions and Scenario Analysis

**Branch**: `002-positions-implementation` | **Spec**: specs/002-positions-scenario-analysis/spec.md | **Date**: 2026-07-07

## Summary

Orders become open positions marked to model under a page-local scenario (spot shift
percent, vol shift points, days forward). All valuation reuses lib/pricing
priceOption. New /positions route, two new analytics events, funnel stage 5.

## Constitution check

Deterministic (no clock reads in valuation; scenario is explicit input). No new
storage patterns (guarded localStorage, one new key). Event names added to tracking
plan before code (done in spec PR #1). TDD for valuation math; Playwright for the
journey. Spec approved in PR #1 before this plan.

## Module layout

- `lib/positions/scenario.ts`
  - `interface Scenario { spotShiftPct: number; volShiftPts: number; daysForward: number }`
  - `const BASE_SCENARIO: Scenario = { spotShiftPct: 0, volShiftPts: 0, daysForward: 0 }`
- `lib/positions/valuation.ts` (pure, unit tested)
  - `lookupEntryIv(leg, underlyingSymbol): number` - from generateChain(underlying, leg.expiration) by strike/type; missing quote returns a flagged fallback per spec edge case
  - `markLeg(leg, iv, underlying, scenario): number` - SIGNED per-share model value (buy +, sell -); stock legs value at shifted spot; option legs priceOption(type, spot', strike, T', vol') with spot' = spot x (1 + spotShiftPct/100), vol' = max(0.01, iv + volShiftPts/100), T' = max(0, T - daysForward/365)
  - `valuePosition(order, scenario): PositionValuation` where `PositionValuation = { modelValue: number; unrealizedPl: number; greeks: Greeks; flagged: boolean }` - modelValue = sum signedMark x 100 x qty; unrealizedPl = modelValue - order.netPremium; greeks share-equivalent x100 under the scenario (same convention as lib/payoff legGreeks; stock = delta only)
  - `valuePortfolio(orders, scenario): { totalPl: number; greeks: Greeks }`
  - `maxDaysForward(orders): number` - min days-to-expiration across open positions' option legs; 0 when none
- `lib/persist/closedPositions.ts` (guarded like orders.ts)
  - key `spread-studio:closed-positions`; `ClosedPosition = { orderId: string; exitValue: number; realizedPl: number; closedAt: string }`
  - `getClosedPositions()`, `closePosition(record)` (no-op if orderId already present)
- `lib/types.ts`: extend `EventName` union with `'scenario_adjusted' | 'position_closed'`; add `ClosedPosition`
- `lib/analytics/funnel.ts`: add stage 5 `{ key: 'position_closed', label: 'Closed a position' }`; stages with zero sessions still render (0-width bar, visible count)
- `app/positions/page.tsx` + `components/ScenarioControls.tsx`, `components/PositionsTable.tsx` (closed section and portfolio summary may live in the page if small)
- `components/Nav.tsx`: add Positions link between Builder and Orders (`nav-positions`)
- `app/analytics/page.tsx`: add both events to the live-session panel list

## Behavior details

- Open positions = getOrders() minus closed orderIds.
- Close uses BASE_SCENARIO valuation regardless of slider state; idempotent via closePosition; after close, the position moves to the Closed section and portfolio totals recompute.
- Scenario sliders (native range inputs): spot -30..30 step 1, vol -20..20 step 1, days 0..maxDaysForward(open) step 1. With no open positions, hide the controls and show the empty state (spec review note 1).
- Reset button zeroes all three and fires ONE `scenario_adjusted` with zeroed properties.
- `scenario_adjusted` debounced 500ms on slider movement, properties { spot_shift_pct, vol_shift_pts, days_forward }.
- `position_closed` properties { underlying, legs, realized_pl }.
- `page_view` fires with path '/positions'.
- Money formatting and green/red P/L semantics identical to v1.

## Testids (e2e contract)

`nav-positions`, `positions-table`, `position-row` (one per open position), `position-pl-{orderId}`, `close-position-{orderId}`, `closed-table`, `closed-row`, `portfolio-pl`, `scenario-spot`, `scenario-vol`, `scenario-days`, `scenario-reset`, `positions-empty`, `live-scenario_adjusted`, `live-position_closed`, `funnel-stage-position_closed`.

## Tests

Unit (tests/unit/positions.test.ts):
1. Base round trip: an order whose legs come from the real chain has unrealized P&L within $0.01 per leg of zero at BASE_SCENARIO.
2. Intrinsic at expiration: daysForward = full DTE gives intrinsic-only marks under shifted spot.
3. Vol floor: volShiftPts = -20 never yields vol below 0.01.
4. Long call theta: value strictly decreases as daysForward goes 0, 5, 10 (other shifts zero).
5. Credit position: a short put position has P&L approximately 0 at entry and positive at daysForward 10.
6. Portfolio aggregation with a covered call (stock leg): delta share-equivalent, other Greeks from the option only.
7. closePosition idempotence and open-list derivation (orders minus closed set).
8. maxDaysForward: 0 for no orders; min across mixed expirations.

E2e (new tests/e2e/positions.spec.ts): place a cash-secured put (credit) order via template, go to /positions, assert position-row present and portfolio-pl near zero, increase scenario-days and assert portfolio-pl positive (short premium gains), scenario-reset, close position, assert closed-row with realized P&L, /analytics shows live-position_closed = 1 and funnel-stage-position_closed renders.

## Notes from spec review (must implement)

1. No open positions: hide sliders, show `positions-empty` (avoids the 0..0 slider).
2. A funnel stage with zero sessions renders gracefully (0-width bar, visible label and count).
