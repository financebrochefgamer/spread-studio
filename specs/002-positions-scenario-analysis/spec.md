# Feature Specification: Positions and Scenario Analysis

**Feature Branch**: `002-positions-scenario-analysis`

**Created**: 2026-07-07

**Status**: In review

**Input**: Roadmap v2 item "Positions and P&L over time (mark-to-model)", reshaped for a
deterministic demo: instead of P&L over wall-clock time, positions are marked to model
under user-controlled scenarios. Source: docs/product/roadmap.md, docs/product/discovery-brief.md.

## Problem

v1 ends the trader loop at the order confirmation. Traders who placed a simulated order
have no way to answer the questions that matter after entry: what is this position worth
now, what happens if the underlying moves, what does time decay cost me this week, and
when should I take it off. Priya (defined-risk spread trader) sizes positions before
entry but manages them after entry. Marcus (income seller) lives on theta decay and
needs to see it. v2 closes the loop: orders become open positions, and a scenario
engine answers "what if" with the same pricing model that built the chain.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See my open positions and what they are worth (Priority: P1)

A trader who has placed simulated orders opens the Positions page and sees each order
as an open position: its legs, entry cost (net debit or credit), current model value,
and unrealized P&L, plus portfolio totals.

**Why this priority**: Without a base mark, nothing else on the page means anything.
This alone completes the build-order-manage loop and is independently demoable.

**Acceptance**:
- Every placed order appears as one open position with underlying, strategy name, legs,
  entry net premium, current model value, and unrealized P&L in dollars.
- Value and P&L are signed to work for debit and credit positions alike: model value
  M = sum over legs of signedMark x 100 x quantity, where signedMark is the leg's
  per-share model value with buy legs positive and sell legs negative. Unrealized
  P&L = M_now - netPremium_entry. At entry this reduces to approximately zero for both
  debit and credit positions.
- Base-scenario leg marks are recomputed with the same priceOption the chain uses
  (single pricing path), so they match the displayed chain mid within one cent of
  rounding.
- Portfolio summary shows total unrealized P&L and net position Greeks (delta, gamma,
  theta per day, vega per vol point, share-equivalent scale) summed across all open
  positions. All open positions share the one scenario.

### User Story 2 - Stress the position with a scenario (Priority: P2)

The trader adjusts three scenario controls: underlying price shift (percent), implied
volatility shift (vol points), and days forward. All positions, P&L, and Greeks reprice
immediately through the pricing model.

**Why this priority**: This is the professional-grade differentiator. It shows theta
decay (days forward), vega exposure (vol shift), and directional risk (spot shift) as
live numbers instead of abstractions.

**Acceptance**:
- Spot shift range -30 to +30 percent (step 1), vol shift range -20 to +20 vol points
  (step 1), days forward range 0 to days-to-nearest-expiration among open positions
  (step 1). Controls hold and emit human units (percent, points, days); formulas
  convert: spot' = spot x (1 + spot_shift_pct / 100),
  per-leg vol' = max(0.01, legIV + vol_shift_pts / 100),
  T' = max(0, T - days_forward / 365). At T' = 0 an option leg is worth intrinsic
  value under spot' (already built into priceOption; no new pricing path).
- Each leg's IV is the static entry-chain IV for that strike/type/expiration, captured
  once. It is NOT re-derived from the chain's term structure as days forward changes;
  only the vol control moves it. This is a deliberate determinism/simplicity choice.
- A visible reset control returns all three to zero and fires one `scenario_adjusted`
  event with zeroed properties.
- Every adjustment fires the `scenario_adjusted` analytics event (debounced 500ms per
  the tracking plan) with the three shift values as properties.
- With a long call position, increasing days forward with other controls at zero
  strictly decreases position value (long calls always have negative theta here).
  Note: a deep in-the-money long put can gain value as days pass (positive theta from
  the rate term); that is correct pricing, not a bug.
- Limitation, stated for clarity: the shared days-forward bound is the nearest
  expiration across open positions, so a longer-dated position cannot be driven to its
  own expiration. Acceptable for v2; revisit with per-position analysis if discovery
  demands it.

### User Story 3 - Close a position (Priority: P3)

The trader closes an open position at its current base-scenario model value. The
position moves to a closed list showing realized P&L.

**Why this priority**: Completes position lifecycle; valuable but the page works
without it.

**Acceptance**:
- Close executes at the base scenario (shifts ignored), so realized P&L equals the
  base-scenario unrealized P&L at that moment.
- Closed positions show entry cost, exit value, and realized P&L, and are excluded from
  open-position portfolio totals.
- Closing fires the `position_closed` analytics event with underlying, legs count, and
  realized P&L.
- Closing is idempotent: a closed position cannot be closed again.

### Edge cases

- Scenario days forward reaching expiration: option legs valued at intrinsic under the
  shifted spot; no negative time to expiration.
- A leg's IV is looked up from the deterministic chain by strike/type/expiration; legs
  always originate from the chain, so a missing quote is a programming error and may
  fail loudly in development, but must not crash the page (fall back to the leg's
  entry price and flag the row).
- No orders yet: the page shows an explanatory empty state, not a blank screen.
- Orders persisted by v1 (before positions existed) must load as open positions without
  migration.
- Storage unavailable: page renders with empty data, never throws (constitution rule).
- Display note: at exactly at-the-money with T' = 0, the model's call delta snaps to 0
  (intrinsic-value branch). This one-point discontinuity in displayed net delta is
  accepted; do not special-case it.

## Requirements *(mandatory)*

### Functional

- FR-001: Open positions derive from persisted orders; closing writes a closed record.
  No duplicate source of truth for entry data. Persistence: closed records live under
  localStorage key `spread-studio:closed-positions` with shape
  { orderId, exitValue, realizedPl, closedAt }. Open positions are the orders list
  minus the closed set, matched by order id; a matching closed record makes close a
  no-op (idempotent).
- FR-002: Valuation uses the existing Black-Scholes engine and chain constants. No new
  pricing code paths; scenario repricing calls the same priceOption used by the chain.
- FR-003: Stock legs value at shifted spot; their Greeks remain delta-only,
  share-equivalent.
- FR-004: All money and Greeks conventions follow v1: per-share premiums, x100 contract
  multiplier, netPremium > 0 is debit, position Greeks share-equivalent.
- FR-005: New route /positions with nav entry between Builder and Orders. Orders page
  keeps order history; positions page owns the lifecycle view.
- FR-006: Scenario state is page-local and resets on reload (it is analysis, not data).
- FR-007: New analytics events `scenario_adjusted` and `position_closed` added to the
  tracking plan (docs/product/success-metrics.md updated in this spec's PR) and to the
  live-session panel on /analytics.
- FR-008: Determinism: identical orders and scenario inputs always produce identical
  values. No clock reads in the valuation path.

### Non-functional

- Playwright covers the P1-P3 journey: place order, see position with near-zero P&L,
  shift spot and observe P&L change, roll days forward and observe decay, close, see
  realized P&L in closed list, verify events on /analytics.
- Unit tests (Vitest) cover the scenario valuation math: base-scenario round trip
  (value matches chain mid within one cent), intrinsic at expiration, vol floor, theta
  monotonicity for a long call, a credit position (short premium) whose unrealized P&L
  is approximately zero at entry and positive as days roll forward, and portfolio
  aggregation including stock legs.
- The Playwright journey asserts the P&L sign for short premium: a credit position
  gains as days forward increases.
- The page follows the v1 visual language and testid conventions; testids are the e2e
  contract and are enumerated in plan.md.

## Success criteria *(mandatory)*

- SC-1: A visitor can complete the full loop (build, order, position, stress, close) in
  under two minutes with no instructions.
- SC-2: The activation funnel gains a fifth stage: `position_closed` is added to the
  funnel definition in docs/product/success-metrics.md (updated in this PR), and the
  /analytics funnel and live-session panel render it.
- SC-3: The theta story is demoable in one gesture: drag days forward, watch a short
  premium position gain and a long premium position decay.
- SC-4: CI green; live demo verified end to end after deploy.

## Out of scope (roadmap items, with reasons)

- Real-time or historical P&L over wall-clock time: requires a moving market; conflicts
  with the deterministic demo constitution. Belongs with the live-data adapter (v2
  roadmap item, unchanged).
- Margin and buying power: own spec (v3).
- Partial closes and quantity edits after entry: adds lot accounting; defer until a
  discovery signal demands it.
- Rolling a position (close + reopen at new strikes/expiration as one ticket): strong
  candidate for spec 003 after this ships.
