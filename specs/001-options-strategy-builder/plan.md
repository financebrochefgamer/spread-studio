# Implementation Plan: Options Strategy Builder

**Branch**: `001-options-strategy-builder` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-options-strategy-builder/spec.md`

**Note**: Codex filled this plan from the approved implementation plan while Claude was
rate-limited. The structure follows the generated `speckit-plan` skill and template.

## Summary

Build Spread Studio as a client-only Next.js app for deterministic multi-leg options
strategy exploration. The app generates synthetic option chains, lets traders build
strategies from templates or custom legs, calculates payoff and Greeks in pure TypeScript,
persists simulated orders and saved strategies locally, and renders a local analytics
dashboard from the tracking plan.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 15 App Router, React 19

**Primary Dependencies**: Tailwind CSS v4, Zustand, Recharts, Vitest, Playwright

**Storage**: localStorage and sessionStorage only, guarded for SSR

**Testing**: Vitest for pure domain modules, Playwright for the primary user journey

**Target Platform**: Browser-hosted web app, deployable to Vercel, no required server state

**Project Type**: Single client-focused web application

**Performance Goals**: Strategy edits update visible analysis within one interaction cycle;
the primary journey completes without network dependency; seeded analytics renders on first
load.

**Constraints**: No external APIs, no database, no auth, no server-side persistence, fixed
market date 2026-07-06, fixed expirations, and deterministic synthetic data.

**Scale/Scope**: 8 underlyings, 4 expirations each, 21 strikes per expiration, 9 templates,
local event cap of 2000 analytics events, one Playwright journey covering the MVP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specs are the source of truth: PASS. This plan implements `spec.md` and the approved
  product docs. No app code exists yet.
- Deterministic demo: PASS. The plan uses fixed market data inputs and local persistence.
- Test discipline: PASS. Domain math is isolated for Vitest and the product journey is
  covered by Playwright.
- Broker-grade UX: PASS. The UI plan prioritizes dense tables, risk metrics, and
  numbers-first workflows.
- Instrument everything: PASS. The analytics modules consume the event dictionary from
  `docs/product/success-metrics.md`.
- Scope discipline: PASS. Live data, auth, databases, margin, futures, and calendars are
  excluded from v1.
- Plain prose: PASS. Planning docs avoid decorative language and implementation hype.

Post-design re-check: PASS. The research, data model, and quickstart preserve all gates.

## Project Structure

### Documentation

```text
specs/001-options-strategy-builder/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
`-- contracts/
    `-- ui-and-events.md
```

### Source Code

```text
app/
|-- layout.tsx
|-- page.tsx
|-- orders/
|   `-- page.tsx
`-- analytics/
    `-- page.tsx

components/
|-- AnalysisPanel.tsx
|-- ChainTable.tsx
|-- ExpirationTabs.tsx
|-- GreeksTable.tsx
|-- LegEditor.tsx
|-- MetricsGrid.tsx
|-- Nav.tsx
|-- OrderTicketModal.tsx
|-- PayoffChart.tsx
|-- TemplatePicker.tsx
`-- UnderlyingPicker.tsx

lib/
|-- types.ts
|-- analytics/
|   |-- events.ts
|   |-- funnel.ts
|   |-- seed.ts
|   `-- store.ts
|-- chains/
|   `-- generate.ts
|-- market/
|   `-- constants.ts
|-- payoff/
|   `-- payoff.ts
|-- persist/
|   |-- orders.ts
|   `-- strategies.ts
|-- pricing/
|   `-- blackScholes.ts
|-- state/
|   `-- builder.ts
`-- strategies/
    `-- templates.ts

tests/
|-- e2e/
|   `-- journey.spec.ts
`-- unit/
    |-- analytics.test.ts
    |-- chains.test.ts
    |-- payoff.test.ts
    `-- pricing.test.ts
```

**Structure Decision**: Use a single Next.js application with pure dependency-free
domain modules under `lib/`. UI components import domain functions client-side. No API
routes or backend services are planned for v1.

## Module Responsibilities

- `lib/types.ts`: shared domain types for underlyings, quotes, Greeks, legs, strategies,
  orders, analytics events, and event names.
- `lib/market/constants.ts`: `MARKET_DATE`, `RISK_FREE_RATE`, fixed expirations, and 8
  synthetic underlyings.
- `lib/pricing/blackScholes.ts`: normal CDF, Black-Scholes pricing, delta, gamma, theta
  per day, and vega per volatility point.
- `lib/chains/generate.ts`: deterministic chain generation, strike ladder, volatility
  skew, and bid/ask around mid.
- `lib/payoff/payoff.ts`: per-leg and strategy P/L at expiration, breakevens, max profit,
  max loss, unlimited detection, and net premium.
- `lib/strategies/templates.ts`: 9 templates that build legs from the current chain
  relative to at the money.
- `lib/analytics/events.ts`: event-name definitions and property typing.
- `lib/analytics/store.ts`: client-side event capture, session id, and storage cap.
- `lib/analytics/funnel.ts`: activation funnel aggregation.
- `lib/analytics/seed.ts`: deterministic seeded demo dataset.
- `lib/persist/orders.ts`: local simulated order CRUD.
- `lib/persist/strategies.ts`: local saved strategy CRUD.
- `lib/state/builder.ts`: Zustand store for underlying, expiration, legs, and template.

## Testing Plan

- Pricing tests verify Black-Scholes prices and Greeks against reference values.
- Chain tests verify deterministic output, 8 underlyings, 4 expirations, and 21 strikes.
- Payoff tests cover every template, breakevens, finite max loss, and unlimited profiles.
- Analytics tests verify event storage limits, seeded data, and funnel aggregation.
- Playwright verifies the journey: pick underlying, build iron condor, verify max loss,
  place order, see order history, and confirm analytics counts.

## Complexity Tracking

No constitution violations require justification.
