# Spread Studio Constitution

## Mission

Spread Studio is an AI-native derivatives strategy platform. The north star,
twin pillars (Strategy Intelligence and Trader Development), competitive
theses, and ambition arcs live in docs/product/vision.md. This constitution
governs how work happens. The vision governs what work is worth doing.

## Core Principles

### I. Specs Are The Source Of Truth

No feature code is written without a spec section that demands it. Product changes
flow from spec to plan to tasks to code. When implementation details conflict with
the spec, the spec is updated or the code is corrected before work continues.

### II. Deterministic Core, Real-Ready Seams

The product works offline and does not depend on fragile external services.
Domain logic uses the fixed market date 2026-07-06 and deterministic inputs,
with no clock-dependent behavior. This is a product identity, not a demo
shortcut: it keeps the platform testable, replayable, and free. By default the
app uses no external APIs, no database, and no auth. Optional integrations are
allowed only behind adapter seams that are off by default and leave the
default experience byte-identical (the Amplitude adapter is the reference
pattern). Any spec that touches market data or order execution must state its
adapter seam, so real data or brokerage rails stay a future integration, not a
rewrite.

### III. Test Discipline

Pure domain math is test-first with Vitest. Pricing, payoff, chain generation, and
analytics aggregation must be tested in isolation, with Black-Scholes outputs checked
against published reference values. Product behavior is verified with Playwright
end-to-end journeys. CI must be green on every push to main.

### IV. Broker-Grade UX

The UI is dark, dense, and numbers-first. Traders read tables, risk metrics, and
clear state changes. Max loss and breakevens are never more than one glance away.
Green and red are reserved for profit and loss semantics.

### V. Instrument Everything

Every meaningful user action fires an analytics event defined in
docs/product/success-metrics.md. Event names and properties in code must match the
tracking plan. No user-facing feature ships without instrumentation.

### VI. Scope Discipline

Build the smallest durable increment that proves the product and the workflow.
Deferred work goes to docs/product/spec-queue.md or docs/product/roadmap.md
with a written reason. Live market data, auth, and databases stay out of the
default product per Principle II and enter only as opt-in adapters demanded by
a spec. Margin modeling, futures, and multi-expiration strategies enter
through their own spec cycles under the vision arcs in docs/product/vision.md.

### VII. Plain Prose

Committed docs, README text, and commit messages use concise plain language. Avoid
em dashes, filler, and marketing gloss. The repo should read like a precise product
artifact, not a pitch deck.

### VIII. Vision Alignment

docs/product/vision.md is the product north star. Every new feature spec
names, in its header, the vision pillar and arc it advances. A feature spec
that advances no pillar is rejected at spec review. Process and docs artifacts
cite the operating model instead of a pillar.

## Project Constraints

- Stack: Next.js App Router, TypeScript, Tailwind CSS, Zustand, Recharts, Vitest,
  Playwright, GitHub Actions, and Vercel.
- Persistence: localStorage or sessionStorage only, always guarded for SSR.
- Market model: fixed MARKET_DATE of 2026-07-06 and RISK_FREE_RATE of 0.04.
- v1 strategies: all option legs in a strategy share one expiration.
- Money convention: option prices are per-share premiums; P/L is dollars using
  premium x 100 x quantity; positive net premium is debit paid and negative net
  premium is credit received.
- Analytics: no PII, no free-text event properties, and local event storage capped.

## Development Workflow

1. Write or update the relevant spec before feature code changes.
2. Generate or curate the technical plan from the spec.
3. Break the plan into executable tasks.
4. Implement task by task, with tests sized to risk.
5. Reference Spec Kit task IDs in implementation commit bodies after tasks exist.
6. Keep the working tree clean at task boundaries.
7. Document any agent or tooling deviation in the local handoff notes for review.

## Governance

This constitution supersedes informal preferences and generated suggestions. Changes
to these principles require a documented reason, an update to affected specs and
plans, and a commit that makes the change visible in project history. Reviews must
check determinism, test coverage, instrumentation, scope, and prose quality before
work is considered complete.

**Version**: 2.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-08
