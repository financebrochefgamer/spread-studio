# Research: Options Strategy Builder

Date: 2026-07-06

## Decision: Client-only deterministic app

Rationale: The repo is a portfolio demo. It must work offline, avoid API keys, and never
fail because of market-data or auth dependencies. Synthetic data proves the product logic
and keeps the review experience stable.

Alternatives considered: Live delayed market data, broker sandbox integration, and a
server-side mock API. All were rejected for v1 because they add fragility without improving
the spec-driven PM story.

## Decision: Next.js App Router with TypeScript

Rationale: Next.js provides a deployable app shell, routing, and Vercel compatibility while
still allowing most logic to run as pure client-side TypeScript. TypeScript supports
explicit domain types for strategy legs, quotes, Greeks, and analytics events.

Alternatives considered: Vite single-page app and a static HTML app. Vite would work, but
Next.js better matches common portfolio deployment and routing expectations. Static HTML
would make state, tests, and charts less maintainable.

## Decision: Pure domain modules under `lib/`

Rationale: Pricing, chain generation, payoff, persistence, and analytics aggregation are
testable without UI. This keeps derivatives math honest and supports test-first work.

Alternatives considered: Keep math inside React components or use a third-party options
library. Component-local math would be hard to test. Third-party math would weaken the
portfolio proof that the agent can implement domain logic from specs.

## Decision: Black-Scholes with deterministic volatility skew

Rationale: Black-Scholes is recognizable, testable against published reference values, and
sufficient for simulated option chains. A simple skew or smile makes chains look plausible
without pretending to be live market data.

Alternatives considered: Hard-coded quotes and Monte Carlo pricing. Hard-coded quotes do
not scale across underlyings and expirations. Monte Carlo is unnecessary for v1 and harder
to validate in a deterministic demo.

## Decision: Single expiration per strategy in v1

Rationale: Verticals, condors, straddles, strangles, covered calls, and cash-secured puts
fit a single-expiration model. Calendars and diagonals need value modeling at the near
expiration rather than only intrinsic value.

Alternatives considered: Multi-expiration strategies in v1. Rejected because they create
extra pricing assumptions and would dilute the MVP.

## Decision: localStorage analytics with seeded demo data

Rationale: The role-facing deliverable is the event taxonomy, activation funnel, and
self-service dashboard. A local implementation proves the measurement model without API
keys or vendor setup.

Alternatives considered: Real Amplitude integration or no analytics persistence. Real
Amplitude is v2 vendor plumbing. No persistence would fail the self-service analytics
requirement.
