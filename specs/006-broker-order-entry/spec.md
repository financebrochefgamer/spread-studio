# Feature Specification: Broker-Grade Order Entry

**Feature Branch**: `006-broker-order-entry`

**Created**: 2026-07-08

**Status**: In review

**Input**: docs/product/spec-queue.md item 006. Directly maps to the target posting's
"Familiarity with broker-dealer platform conventions, order entry UX" and "what
separates professional-grade tools from consumer-grade experiences." User request:
make the product feel like a real trading platform, not a toy.

## Problem

The current order ticket (components/OrderTicketModal.tsx) does exactly one thing:
confirm, fill at mid, done. There is no order type, no price control, no sense that a
trade might not fill, and no warning before a trader commits to a position with
unlimited risk, a wide spread, or an unusually complex structure. Every real
broker-dealer platform imposes friction here on purpose, because an order ticket is a
risk-communication surface, not just a confirm button. This gap is the difference
between "a strategy builder with a confirm button" and "something that feels like a
broker-dealer platform."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose market or limit, and see a limit order that does not fill immediately (Priority: P1)

A trader building a strategy chooses between a market order (fills now, at the same
mid-price behavior the app already has) and a limit order (trader sets a net price
for the whole strategy; it fills immediately only if marketable, otherwise it becomes
a working order that has not filled).

**Why this priority**: This is the single biggest gap between "toy" and "platform."
Every real options ticket asks market-or-limit before anything else.

**Acceptance**:
- The ticket gains an order type control: Market (default, unchanged behavior) or
  Limit.
- Limit orders set one net price for the whole strategy, `netLimitPrice`, using the
  exact same signed convention `strategyNetPremium` (lib/payoff/payoff.ts) already
  uses for `Order.netPremium`: positive means a debit (the trader pays that much
  net), negative means a credit (the trader receives that much net), zero means an
  even-money strategy. Per-leg limit pricing is out of scope (see Out of scope).
- Marketability rule, one inequality, no debit/credit case split, because both sides
  already share one sign convention: **marketable iff `netMid <= netLimitPrice`**,
  where `netMid` is the strategy's current `strategyNetPremium(legs)` value (the same
  number a market order would use).
  - Worked debit example: trader buys a bull call spread, `netMid = +1.50` (a $1.50
    debit at market). Willing to pay up to $2.00: `netLimitPrice = +2.00`. Is
    `1.50 <= 2.00`? Yes, marketable (over-bidding a cheaper market always fills).
    Willing to pay only $1.00: `netLimitPrice = +1.00`. Is `1.50 <= 1.00`? No, not
    marketable (market wants more than the trader will pay).
  - Worked credit example: trader sells an iron condor, `netMid = -1.00` (a $1.00
    credit at market; more negative means a larger credit). Willing to accept as
    little as $0.80: `netLimitPrice = -0.80` (the least-negative, i.e. worst,
    acceptable credit). Is `-1.00 <= -0.80`? Yes, marketable (the market's $1.00
    credit is better than the $0.80 minimum, so it fills). Demanding at least $1.20
    (`netLimitPrice = -1.20`): is `-1.00 <= -1.20`? No, not marketable (market isn't
    offering enough credit).
- A marketable order (market OR limit) always fills at `netMid`, never at the
  trader's limit. This is a deliberate simplification, not price improvement: this
  app has one deterministic reference price (mid), not a real order book with
  separate best-bid/best-ask depth, so "fills at the best available price" collapses
  to "fills at mid" here. A marketable limit therefore produces the exact same
  `Order.netPremium` a market order would, which is what makes "fills exactly like a
  market order does today" literally true, not just directionally similar. The
  trader's limit only ever gates *whether* it fills, never *what price* it fills at.
- A non-marketable limit order does NOT create a position. It creates a working order
  record instead (Requirements below define its shape and persistence key), visible
  in a new "Working Orders" section on the Orders page, with quantity, legs, limit
  price, and a Cancel action.
- Canceling a working order removes it and creates no position. Idempotent: canceling
  an already-canceled or already-filled order is a no-op, not an error.

### User Story 2 - See a risk warning before confirming any order (Priority: P2)

Before confirming any order (market or limit), the ticket shows deterministic,
rule-based warnings when they apply. Warnings are informational: the trader can still
confirm past them. This matches real broker UX (a warning the trader acknowledges by
proceeding), and avoids a blocking-override flow that would need its own spec.

**Why this priority**: This is the specific, concrete signal of "professional-grade"
the posting names. A ticket with no friction before an unlimited-risk trade reads as
consumer-grade regardless of how good the payoff chart looks.

**Acceptance**:
- Unlimited risk warning: shown when the strategy's `analyzeStrategy` result has
  `maxLoss === 'Unlimited'` or `maxProfit === 'Unlimited'` (the exact existing
  sentinel from lib/payoff/payoff.ts; no new math, no Infinity, no separate check).
- Wide spread warning: shown per leg where `(ask - bid) / mid > 0.08` for that leg's
  quote. The 8% threshold is verified against the actual chain generator's spread
  formula (lib/chains/generate.ts, spread = max(0.02, mid * spreadBps/10000 + 0.01)).
  The mechanism that drives a leg past 8% is low absolute price, not which
  underlying it belongs to: the flat $0.01 addend and $0.02 floor dominate the ratio
  once a quote's mid drops below roughly $0.25, regardless of that underlying's
  spreadBps, so the warning naturally targets cheap, far-OTM legs (commonly 10-100%
  once mid falls under a dime) while leaving normally-priced liquid legs (typically
  under 1%, verified across every underlying's real spreadBps range) unflagged. See
  plan.md for the exact computed values across sample quotes. Names which leg(s)
  triggered it.
- Complex order warning: shown when `legs.length > 4`.
- All applicable warnings show together; none of them block the confirm button.
- No warning fires when none of these conditions hold (the common case: a simple,
  liquid, defined-risk strategy shows no warnings at all).

### User Story 3 - Set time in force, captured honestly as not simulated (Priority: P3)

The ticket gains a time-in-force control (Day or GTC), captured and displayed on the
order or working order record.

**Why this priority**: Named directly in professional-development/domain-knowledge.md
as a broker convention; capturing it is cheap and completes the ticket's realism.
Simulating its actual lifecycle (a Day order expiring unfilled) is not attempted here
(see Out of scope) because this app has no simulated calendar advancement outside the
positions scenario page's scenario-only "days forward" control, and wiring TIF
expiration to that would be a materially different, larger feature.

**Acceptance**:
- Time in force selector: Day or GTC. No default preference specified here; plan.md
  picks one and states why.
- The value is stored on the order/working-order record and displayed on the Orders
  page. It has no effect on fill behavior or working-order lifecycle in v1.

### Edge cases

- `netLimitPrice` is signed (debit positive, credit negative) per the marketability
  rule above, so zero and negative values are both legitimate strategy prices (an
  even-money strategy, or any credit strategy) and must NOT be rejected. The only
  input to reject is a non-numeric or non-finite value, the same basic validation
  already applied to other numeric inputs in the app.
- A working order's underlying chain quote changes because the trader navigates away
  and reopens the builder with a different underlying: the working order retains its
  original leg quotes and limit price (it is a persisted record, not a live view); it
  does not re-evaluate marketability until the trader takes an explicit action in a
  future spec (there is no "check working orders for fills" background process in
  v1; see Out of scope).
- Every leg missing a valid quote (should not happen given legs always originate from
  a generated chain, but defensively): the wide-spread check simply does not fire for
  that leg rather than crashing.
- Canceling a working order that was already canceled or already filled: no-op, per
  User Story 1.

## Requirements *(mandatory)*

### Functional

- FR-001: New type `WorkingOrder` (or equivalent) capturing: id, createdAt,
  underlyingSymbol, expiration, legs, netLimitPrice, timeInForce ('day' | 'gtc'),
  status ('working' | 'canceled'). No `orderType` field: a working order is always
  the limit case (a market order that isn't marketable does not exist by
  definition), so the field would be redundant here even though `Order` keeps it.
  Persisted the same way `Order` already is (existing localStorage pattern in
  lib/persist/orders.ts, guarded try/catch per constitution), under its own new key
  `spread-studio:working-orders` (a distinct collection from `spread-studio:orders`,
  same read-returns-empty-array-on-missing-or-corrupt-data behavior).
- FR-002: The existing `Order` type gains OPTIONAL `timeInForce` and `orderType`
  fields so a filled market or marketable-limit order also records what it was.
  Optional, not required, specifically so this is non-breaking: existing `Order`
  literals already constructed elsewhere in the codebase (for example in
  tests/unit/positions.test.ts) continue to compile unchanged, and any `Order`
  already persisted in localStorage from a session before this spec shipped reads
  back with these fields simply absent, not malformed. The Orders page displays a
  sensible default (e.g. "Market") when either field is missing on an older record.
- FR-003: Marketability and fill-price logic lives in one pure function, unit tested,
  not duplicated between the ticket UI and any persistence code.
- FR-004: Risk-warning logic (unlimited risk, wide spread, complex order) is computed
  entirely from `analyzeStrategy`'s existing return shape (lib/payoff/payoff.ts) and
  the chain quotes already generated for the builder; no new pricing or payoff math,
  no new API surface into lib/payoff. Note this is a real change to
  components/OrderTicketModal.tsx's current behavior, not a no-op: the ticket does
  not call `analyzeStrategy` today (it only calls `strategyNetPremium`), so the
  implementation must add that call (or receive the result as a prop from wherever
  the builder already computes it) to have the data these warnings need.
- FR-005: Placing a non-marketable limit order is a meaningful user action
  (constitution principle V) and must not be reported as `order_placed`, since that
  would corrupt the existing fill funnel with actions that created no position
  (breaking SC-1's "zero analytics inconsistency" requirement). Two new events, added
  to docs/product/success-metrics.md in the same PR as this spec: `working_order_placed`
  (properties: `underlying`, `legs`, `net_limit_price`), fired when a limit order is
  not marketable and becomes a working order instead; `working_order_canceled`
  (properties: `underlying`, `legs`), fired on a real cancel (not on the idempotent
  no-op case of canceling an already-canceled or already-filled order).
  `order_placed` continues to fire, unchanged, for every order that actually fills
  (a market order, or a marketable limit).

### Non-functional

- Determinism: all warning thresholds and marketability checks are pure functions of
  data already in the app (chain quotes, payoff analysis, trader input); no clock
  reads, no randomness.
- Unit tests cover: marketability for a marketable limit (debit and credit cases),
  marketability for a non-marketable limit (debit and credit cases), the exact 0.08
  wide-spread boundary (just under vs. just over, using real generated quotes, not
  synthetic bid/ask pairs invented for the test), the unlimited-risk warning firing
  from the real `'Unlimited'` sentinel, the complex-order boundary at exactly 4 vs 5
  legs, and working-order cancel idempotence.
- Playwright coverage extends the existing order-ticket journey: build a strategy
  whose current market price makes a chosen limit non-marketable, confirm it as a
  limit order, see no position created, see it appear as a working order, cancel it.
  A second scenario confirms a marketable limit fills like a market order today.

## Success criteria *(mandatory)*

- SC-1: A trader can place a limit order that does not fill, see it as a working
  order, and cancel it, with zero position or analytics inconsistency versus the
  existing filled-order path.
- SC-2: Placing an iron condor (inherently defined-risk, so no unlimited-risk
  warning) triggers no false-positive warnings under normal liquid quotes, and
  placing a naked short call (unlimited risk) reliably triggers the unlimited-risk
  warning, proving the rule discriminates correctly rather than firing on everything
  or nothing.
- SC-3: CI green; the existing e2e journeys (chain to order, positions/scenario,
  MCP-adjacent flows) remain unaffected by this change.

## Out of scope (with reasons)

- Per-leg limit prices. Real complex-order books support both net-price and per-leg
  limits; net-price-only is the simpler, still-realistic v1, and per-leg limits would
  roughly double this spec's surface area for a marginal realism gain.
- Time-in-force lifecycle simulation (a Day order expiring unfilled at end of day).
  This app has no simulated calendar advancement outside the positions scenario
  page's scenario-only days-forward control; wiring TIF to a real passage of time is
  a separate, larger feature.
- A background process that re-checks working orders against updated quotes and
  fills them later. Also requires simulated time passage; deferred with TIF
  expiration for the same reason.
- Order modification (cancel/replace). Only full cancellation of a working order is
  in scope; replacing it with a new price is functionally "cancel, then place a new
  order," already achievable with existing UI.
- Partial fills. Every fill in this app is all-or-nothing, matching v1's existing
  simulated-fill model; multi-leg partial fills are a materially harder problem real
  brokers handle with their own dedicated logic.
- Real NBBO or venue routing. The app's mid-price and marketability model is already
  a deliberate simplification (constitution: deterministic demo); this spec does not
  change that posture, it adds realistic friction on top of it.
- Blocking confirmation on a warning (e.g. requiring a second click or a typed
  acknowledgment). Warnings are informational per User Story 2; a blocking flow is a
  distinct UX pattern that would need its own acceptance criteria.
- Margin or buying-power display alongside the warnings. Named in
  docs/product/spec-queue.md as a separate candidate (009) that should land after
  this spec, on the same ticket surface, once order entry itself exists to attach it
  to.
