# Roadmap

Date: 2026-07-06

## v1: Strategy Builder MVP

Synthetic chains, 9 templates, custom leg editor, live risk analysis, simulated order
flow, and usage analytics dashboard. Success means the full journey works in the live
demo with CI green.

## v2: Data and measurement

- Live delayed market data behind a provider adapter. Deferred from v1 because API keys
  and rate limits make demos fragile, and synthetic data proves the product logic just as
  well.
- Real Amplitude destination for the existing event taxonomy. Deferred because the
  tracking plan and funnel math are the PM deliverable; vendor wiring is plumbing.
- Positions and P/L over time using mark-to-model. Deferred from v1 because it would
  have doubled scope. Shipped 2026-07-07 as specs/002-positions-scenario-analysis,
  reshaped as scenario-based mark-to-model (spot, vol, and time shifts) to stay inside
  the deterministic-demo constitution. Ran the full cycle: spec PR reviewed to APPROVE
  across two rounds, plan, tasks, implementation reviewed and merged, deployed, and
  verified end to end in production.

## v3: Breadth

- Futures chains and futures options. Margin and tick conventions differ enough to be
  their own spec.
- Calendars and diagonals. These require multi-expiration payoff modeling, because the
  far leg must be valued at near expiration with a pricing model, not just intrinsic
  value.
- Margin and buying-power modeling per strategy.
- Alerts and mobile layout.

Each item graduates by getting its own spec under specs/NNN-name/ before any code.

## Spec queue and role-alignment gap analysis

docs/product/role-gap-analysis.md maps this repo against a target PM role in depth: a
strengths scorecard, 15 named gaps with what to build for each, and a phased plan for
closing them (finish in-flight work, then cheap high-signal process docs, then
vendor-ready analytics, then broker-grade risk depth, then derivatives and platform
breadth). Treat it as the working spec queue alongside this roadmap.
