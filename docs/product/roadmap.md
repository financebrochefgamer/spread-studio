# Roadmap

Date: 2026-07-06. Vision anchor added 2026-07-08.

## North star and arcs (2026-07-08 onward)

docs/product/vision.md is the product north star. Future work organizes under
its four ambition arcs: Arc 1 Strategy Intelligence depth, Arc 2 Trader
Development arena, Arc 3 Agentic platform, Arc 4 Breadth and reach. The
version-numbered sections below are the historical record of how v1 through v5
shipped. New items land in docs/product/spec-queue.md tagged with a pillar and
arc, not in new version sections here.

## v1: Strategy Builder MVP

Synthetic chains, 9 templates, custom leg editor, live risk analysis, simulated order
flow, and usage analytics dashboard. Success means the full journey works in the live
demo with CI green.

## v2: Data and measurement

- Live delayed market data behind a provider adapter. Deferred from v1 because API keys
  and rate limits make demos fragile, and synthetic data proves the product logic just as
  well.
- Real Amplitude destination for the existing event taxonomy. Deferred from v1
  because the tracking plan and funnel math were the PM deliverable and vendor
  wiring was plumbing. Shipped 2026-07-07 as specs/005-amplitude-adapter: an
  optional, off-by-default destination that forwards every tracked event to
  Amplitude, fire-and-forget, when NEXT_PUBLIC_AMPLITUDE_API_KEY is set. The public
  demo does not set this var and stays byte-for-byte unchanged (confirmed by an
  unchanged initial bundle size). Ran the full cycle: spec PR reviewed across three
  rounds (real catches include a fire-and-forget mechanism that was initially wrong,
  a build-time-env-var claim that needed correcting against next.config.ts, and a
  self-contradiction introduced while fixing the first issue), implementation
  reviewed and merged. Proven correct with fully mocked unit tests; no live
  Amplitude account exists or is needed for this repo.
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

## v5: Broker-grade order entry

- Market and limit orders, working orders, pre-trade risk warnings, time in force.
  Shipped 2026-07-08 as specs/006-broker-order-entry. Directly targets the posting's
  "broker-dealer platform conventions, order entry UX" and "what separates
  professional-grade tools from consumer-grade experiences." Marketability is one
  unbranched signed inequality (netMid <= netLimitPrice); a marketable order always
  fills at netMid, never at the trader's limit. Ran the full cycle: spec PR reviewed
  across two rounds, both of which caught real bugs (an inverted marketability rule
  and a wrong fill-price claim, the third recurrence of this repo's signed-money
  sign-direction bug class per docs/process/playbook.md), implementation reviewed
  (the reviewer independently replicated the chain-generator formulas to verify a
  self-reported wide-spread finding rather than trust it), deployed, and verified
  end to end in production.
- Margin and buying-power display now unblocked on the same order-ticket surface
  (docs/product/spec-queue.md item 009).

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

docs/product/spec-queue.md is the living, structured spec queue: shipped work,
in-progress work, and a ranked candidate backlog with role-signal evidence for each
item. It supersedes the flat list this roadmap used to hold directly.

docs/product/role-gap-analysis.md is the original, deeper gap analysis it was built
from: a strengths scorecard and 15 named gaps against a target PM role. Its
forward-looking "what to build" content became the spec queue's candidate backlog;
its "learning notes" content (domain and skill gaps a person has to actually learn,
not something the repo can build) moved to professional-development/, which is
personal career development, not a product artifact.
