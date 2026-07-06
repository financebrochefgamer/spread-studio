# Spread Studio Constitution

## Core Principles

### I. Specs Are The Source Of Truth

No feature code is written without a spec section that demands it. Product changes
flow from spec to plan to tasks to code. When implementation details conflict with
the spec, the spec is updated or the code is corrected before work continues.

### II. Deterministic Demo

The demo must work offline and must not depend on fragile external services. The app
uses no external APIs, no database, no auth, and no clock-dependent domain logic.
Domain logic uses the fixed market date 2026-07-06 and deterministic inputs.

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

Build the smallest durable v1 that proves the product and the workflow. Deferred
work goes to docs/product/roadmap.md with a written reason. Do not add live market
data, auth, databases, margin modeling, futures, or multi-expiration strategies in
v1 unless a new spec explicitly replaces this constitution.

### VII. Plain Prose

Committed docs, README text, and commit messages use concise plain language. Avoid
em dashes, filler, and marketing gloss. The repo should read like a precise product
artifact, not a pitch deck.

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

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
