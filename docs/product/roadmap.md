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

## v4: Self-service analytics infrastructure

- Analytics MCP server. Shipped 2026-07-07 as specs/004-analytics-mcp-server: a
  local, read-only, stdio-transport MCP server exposing the activation funnel,
  template popularity, and event counts as three typed tools over the deterministic
  seed dataset, reusing the existing lib/analytics/funnel.ts functions rather than
  reimplementing them. Directly maps to the target posting's "self-service analytics
  dashboards ... using internal MCP connections." Ran the full cycle: spec PR
  reviewed to APPROVE across two rounds (one Blocking finding: an early draft claimed
  the live page rendered conversion percentages it does not; fixed by scoping the
  percentage field as a tool-only derived value with its own stated formula),
  implementation reviewed and merged. No deploy step: this server is a standalone
  local process, not part of the Vercel-deployed web app.
- Real Amplitude destination for the existing event taxonomy remains deferred (see
  v2 above); the MCP server proves the "own dashboards" capability without needing a
  live vendor integration first.

## v3: Breadth

- Futures chains and futures options. Margin and tick conventions differ enough to be
  their own spec. specs/003-futures-risk-preview specs a synthetic tick/point risk
  preview, deliberately spec-only: a demonstration that a spec is a complete PM
  deliverable on its own, and a scope call that options depth mattered more than
  futures breadth for this repo's first two build cycles. Promote to a plan and
  implementation if that call changes.
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
