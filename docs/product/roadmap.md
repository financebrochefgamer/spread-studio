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
  have doubled scope. Promoted: now in flight as
  specs/002-positions-scenario-analysis, reshaped as scenario-based mark-to-model
  (spot, vol, and time shifts) to stay inside the deterministic-demo constitution.

## v3: Breadth

- Futures chains and futures options. Margin and tick conventions differ enough to be
  their own spec.
- Calendars and diagonals. These require multi-expiration payoff modeling, because the
  far leg must be valued at near expiration with a pricing model, not just intrinsic
  value.
- Margin and buying-power modeling per strategy.
- Alerts and mobile layout.

Each item graduates by getting its own spec under specs/NNN-name/ before any code.
