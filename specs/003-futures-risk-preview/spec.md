# Feature Specification: Futures Risk Preview

**Feature Branch**: `003-futures-risk-preview`

**Created**: 2026-07-07

**Status**: Spec-only by design. Not scheduled for implementation. See "Why this spec
stops here" below.

**Input**: docs/product/role-gap-analysis.md Gap 4 (futures and broader derivatives
breadth); docs/product/roadmap.md v3 "Futures chains and futures options."

## Why this spec stops here

Every other spec in this repo (001, 002) went through the full cycle: spec, plan,
tasks, implementation, review, deploy. This one does not, on purpose. The posting this
repo targets asks for "complex options strategies, futures, and derivatives tooling"
knowledge and for specs precise enough that an agent could build from them. A spec
that is genuinely ready to hand to an implementer, sitting deliberately unbuilt next
to two that were built, is itself evidence: it shows the difference between "I can
write a spec" and "I chose not to build this one," with the reason stated. The reason
here is scope, not difficulty: shipping this alongside options risked diluting the
options depth that is the stronger, more differentiated story for an options-heavy
active-trader role. Futures becomes the next spec cycle if and when that's the right
call.

## Problem

Futures traders think in points and ticks, not option premiums, and a dollar move in
one contract can mean a very different dollar move in another. TradeStation's own
posting names futures explicitly alongside options. This repo's domain model
(lib/pricing, lib/payoff) is entirely option-shaped: per-share premiums, x100 contract
multiplier, Black-Scholes Greeks. None of that transfers to futures, and pretending it
does would be a domain-knowledge red flag, not a strength. Futures need their own
money model from the ground up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a futures contract's risk in real terms (Priority: P1)

A trader picks a synthetic futures contract and a quantity, and sees the dollar value
of a one-tick move and a one-point move for that specific contract, not a generic
formula, because tick value varies by contract (an ES-style equity index future and a
CL-style energy future do not share a tick value).

**Acceptance**:
- Each synthetic contract publishes symbol, description, tick size, tick value,
  contract multiplier (point value), and a synthetic last price, and that last price is
  an exact whole number of ticks from zero (so tick-based rounding is always
  unambiguous; see User Story 2).
- The trader selects a contract, a side (long or short), and a quantity. Quantity is a
  positive integer; side is a separate explicit field, not encoded as a signed
  quantity.
- Selecting a contract and a quantity shows: dollar value per tick, dollar value per
  point, and current notional exposure (last price x multiplier x quantity). Notional
  exposure is unsigned (a size, not a P&L) and does not depend on side.
- Switching contracts recalculates immediately; no formula is shared across contracts
  that have different tick/point values.

### User Story 2 - Stress a futures position with a price scenario (Priority: P2)

A trader shifts the synthetic contract's price by ticks or by percent and sees P&L in
dollars, using that contract's own tick value, not a percentage-of-notional
approximation.

**Acceptance**:
- Scenario input accepts either a tick count or a percent move. Percent mode converts
  to a raw price delta (lastPrice x percent), then rounds that delta to the nearest
  whole number of ticks, rounding half away from zero. The rounded tick count is then
  the single source of truth: both input modes compute P&L from a tick count, so they
  cannot silently disagree once the percent has been converted.
- directionSign = 1 if side is long, -1 if side is short.
- ticksMoved = (tick-mode: the entered tick count as signed, positive for a price
  increase, negative for a decrease) or (percent-mode: round(lastPrice x percent /
  tickSize), rounded half away from zero).
- P&L = directionSign x ticksMoved x tickValue x quantity. A long position gains when
  ticksMoved is positive (price rose); a short position gains when ticksMoved is
  negative (price fell).
- Deterministic: synthetic last price is a fixed constant per contract, not derived
  from any external feed.

### User Story 3 - Understand margin as a placeholder, not a real number (Priority: P3)

A trader sees an initial and maintenance margin figure per contract, clearly labeled
as a simplified placeholder, so the repo demonstrates awareness of the concept without
overclaiming a real margin model (real futures margin depends on exchange SPAN/PORTFOLIO
methodology this repo does not implement).

**Acceptance**:
- Each synthetic contract publishes a flat initial and maintenance margin dollar
  figure, labeled "simplified placeholder, not exchange margin."
- No margin call logic, no cross-margining, no portfolio margin. Single-contract
  display only.

### Edge cases

- Zero or negative quantity: reject at the input, do not compute a P&L for it.
- Percent-mode scenario input that doesn't land on an exact tick: round to the nearest
  tick before computing P&L, so the two input modes never silently disagree.
- Contract multiplier and tick value must be internally consistent: tickValue =
  tickSize x contractMultiplier for every synthetic contract, checked in a unit test,
  not just asserted in the data.

## Requirements *(mandatory)*

### Functional

- FR-001: A synthetic futures universe of at least 4 contracts spanning different tick
  economics: an equity-index-style contract, an energy-style contract, a rate-style
  contract, and a metals-style contract. Values are fictional and clearly synthetic
  (this repo does not reproduce real exchange contract specs).
- FR-002: New pure module, not sharing code with the options pricing/payoff modules.
  Futures money math is linear (price x multiplier), fundamentally different from
  options' Black-Scholes path; forcing a shared abstraction would be the wrong
  simplification.
- FR-003: No order flow, no positions, no analytics events for this spec. It is a
  standalone risk-preview page. Extending it into the existing order/position system
  is out of scope and would be its own spec if promoted later.
- FR-004: Determinism: fixed synthetic last price per contract, no clock reads, no
  external data.

### Non-functional

- Unit tests: tick/point value consistency per contract, P&L sign correctness for
  long and short, tick-mode and percent-mode scenario equivalence, zero/negative
  quantity rejection.
- Visual language matches the rest of the app (dark, dense, numbers-first) if and when
  implemented; this spec does not include UI mockups because it is not scheduled for
  a plan or tasks cycle.

## Success criteria *(mandatory)*

- SC-1: A reader who knows nothing about futures can, from this spec alone, correctly
  explain why a one-point move means different dollars on different contracts.
- SC-2: If this spec is ever promoted to implementation, `/speckit.plan` can be run
  against it without a clarification round, because every formula, edge case, and
  scope boundary is already explicit.

## Out of scope (with reasons)

- Real futures data or real contract specifications: this repo's core constitution is
  a deterministic demo; no live feed, ever, without its own adapter spec.
- Futures options: combines this spec's linear P&L model with options' Black-Scholes
  model; genuinely a third spec, not a small extension of either.
- Real margin (SPAN, portfolio margin, cross-margining): a compliance and risk-systems
  problem, not a portfolio-demo problem; the placeholder in US3 exists so the gap is
  named, not solved.
- Roll behavior and calendar spreads across futures expirations: same class of problem
  as options calendars (specs/001's out-of-scope list), deferred for the same reason.
- Any implementation, plan, or task list. This document is the complete deliverable.
