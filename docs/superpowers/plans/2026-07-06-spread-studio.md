# Spread Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public portfolio repo containing a multi-leg options strategy builder, spec'd via real GitHub Spec Kit artifacts and built by Claude Code, with a live Vercel demo. It targets the TradeStation Active Trader PM posting.

**Architecture:** Next.js App Router single app. All domain math (Black-Scholes pricing, synthetic chain generation, payoff analysis, analytics aggregation) lives in pure dependency-free TypeScript modules under `lib/`, unit tested with Vitest and runnable client-side. No database, no auth, no external APIs. Persistence (orders, saved strategies, analytics events) is localStorage only. One Playwright e2e covers the whole user journey.

**Tech Stack:** Next.js 15 + React 19 + TypeScript, Tailwind CSS v4, Zustand, Recharts, Vitest, Playwright, GitHub Actions, Vercel, GitHub Spec Kit (specify CLI).

## Global Constraints

Every task implicitly includes these. Copied from the approved design spec at `docs/superpowers/specs/2026-07-06-spread-studio-design.md`.

- Repo root: `D:\spread-studio`. Host is Windows 11; shell commands below are PowerShell-safe unless noted.
- The PM artifacts (constitution, specs, PM docs) must land in commits BEFORE any application code. Commit history is part of the deliverable.
- Real GitHub Spec Kit tooling. The `/speckit.specify`, `/speckit.plan`, `/speckit.tasks` slash commands must genuinely produce the files in `specs/001-*/`.
- Deterministic everything: fixed `MARKET_DATE = '2026-07-06'`, fixed expiration dates, `RISK_FREE_RATE = 0.04`, no `Date.now()` in domain logic, no network calls in the app.
- No database, no auth, no external APIs, no server-side persistence. localStorage/sessionStorage only, always guarded for SSR (`typeof window === 'undefined'`).
- v1 restriction: all option legs in a strategy share one expiration (no calendars). The expiration is selected at strategy level.
- Dark, dense, broker-grade UI. Numbers right-aligned, tabular-nums, green/red only for P/L semantics.
- Prose in all committed docs (README, PM docs, commit messages): no em-dashes, plain sentences, concise.
- Commit style: conventional commits (`feat:`, `test:`, `docs:`, `chore:`, `ci:`). After Task 6 exists, reference Spec Kit task IDs in commit bodies where a commit implements one (e.g. `Implements: T012`).
- Money convention: option `price` fields are per-share premiums. P/L values are dollars (premium x 100 x quantity). `netPremium > 0` means debit paid, `< 0` means credit received.
- The interview talking-points doc is written to `D:\spread-studio-notes\` and is NEVER committed to the repo.
- Node 20+ required (`node --version` to confirm before Task 7).

---

## Phase A: Spec Kit and PM artifacts (no app code yet)

### Task 1: Repo prep

**Files:**
- Modify: git branch name
- Create: `.gitignore`

**Interfaces:**
- Produces: `main` branch, `.gitignore` covering Node/Next artifacts.

- [ ] **Step 1: Rename branch and verify state**

```powershell
Set-Location D:\spread-studio
git branch -m master main
git log --oneline
```

Expected: one commit ("Add design spec for Spread Studio PM showcase repo") on `main`.

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules/
.next/
out/
coverage/
playwright-report/
test-results/
.vercel/
*.tsbuildinfo
.env*
.DS_Store
```

- [ ] **Step 3: Commit**

```powershell
git add .gitignore
git commit -m "chore: add gitignore for Node/Next artifacts"
```

### Task 2: Spec Kit init and constitution

**Files:**
- Create: `.specify/` (scaffolded), `.claude/commands/speckit.*.md` (scaffolded), `.specify/memory/constitution.md`

**Interfaces:**
- Produces: working `/speckit.*` slash commands in this repo; committed constitution.

- [ ] **Step 1: Install uv if missing, then the specify CLI**

```powershell
uv --version
# If that fails:
winget install --id=astral-sh.uv -e
# Then:
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify version
```

Expected: `specify version` prints a version.

- [ ] **Step 2: Initialize Spec Kit into the current directory**

```powershell
Set-Location D:\spread-studio
specify init . --force --integration claude
```

If the installed version rejects `--integration`, run `specify init --help` and use the older form `specify init . --force --ai claude`. Expected: `.specify/` and `.claude/commands/speckit.*.md` created.

- [ ] **Step 3: Run `/speckit.constitution`** (as a Claude Code slash command in this repo) with exactly this argument text:

```text
Create a constitution for Spread Studio, a portfolio project demonstrating spec-driven,
AI-first product development. Principles:
1. Specs are the source of truth. No feature code without a spec section that demands it.
   Changes flow spec -> plan -> tasks -> code.
2. Deterministic demo. No external APIs, no database, no auth, no clock-dependent domain
   logic. Fixed market date 2026-07-06. The demo must work offline and never break.
3. Test discipline. Pure domain math (pricing, payoff, chain generation, analytics
   aggregation) is TDD with Vitest against published reference values. Product behavior is
   verified by Playwright end-to-end journeys. CI must be green on every push to main.
4. Broker-grade UX. Dark, dense, numbers-first. Traders read tables, not marketing pages.
   Max loss and breakevens are never more than one glance away.
5. Instrument everything. Every meaningful user action fires an analytics event defined in
   docs/product/success-metrics.md. No untracked features.
6. Scope discipline. YAGNI. Deferred work goes to docs/product/roadmap.md with a written
   reason, not into the codebase.
7. Plain prose in all docs: no em-dashes, short sentences, concise.
```

- [ ] **Step 4: Review the generated `.specify/memory/constitution.md`**

Confirm all 7 principles appear. Fix wording by editing the file directly if the generator mangled anything. Remove any placeholder tokens like `[PROJECT_NAME]`.

- [ ] **Step 5: Commit**

```powershell
git add .specify .claude .gitignore
git commit -m "docs: initialize Spec Kit and project constitution"
```

### Task 3: PM discovery brief, success metrics, roadmap

**Files:**
- Create: `docs/product/discovery-brief.md`
- Create: `docs/product/success-metrics.md`
- Create: `docs/product/roadmap.md`

**Interfaces:**
- Produces: the event taxonomy (names quoted verbatim by `lib/analytics` in Task 12) and the persona/JTBD language reused by the spec in Task 4.

- [ ] **Step 1: Write `docs/product/discovery-brief.md`**

```markdown
# Discovery Brief: Multi-Leg Options Strategy Builder

Date: 2026-07-06
Author: PM
Status: Input to specs/001 (spec.md)

Method note: this is a portfolio project. The personas below are synthesized from public
trader-community research (broker forums, options-education communities) and formatted the
way a real discovery brief from 6 to 8 customer interviews would be.

## Problem

Active options traders assemble multi-leg positions (verticals, condors, straddles) in
tools that treat the order ticket as the product. Risk comprehension comes last: max loss,
breakevens, and net Greeks are buried behind extra clicks or missing entirely. Traders
either build spreadsheets on the side or take positions whose risk shape they have not
actually seen.

## Personas

### 1. Marcus, 54: The Income Trader
Sells covered calls and cash-secured puts monthly against a long-term portfolio.
- JTBD: "When I pick a strike to sell, I want to see premium vs. assignment risk side by
  side, so I can collect income without surprise assignments."
- Pains: comparing candidate strikes is manual; breakeven after premium is mental math;
  chain UIs optimize for speed of order entry, not decision quality.

### 2. Priya, 38: The Defined-Risk Spread Trader
Software engineer. Trades verticals and iron condors weekly, often around events.
- JTBD: "When I structure a spread, I want max loss and breakevens to update live as I
  adjust legs, so I can size the position before I commit."
- Pains: leg entry is slow; risk metrics appear only on a separate analyze tab; editing
  one leg often silently rebuilds the whole ticket.

### 3. Dev, 27: The Aspiring Multi-Leg Trader
Comfortable with single-leg calls and puts. Understands spread theory, has never placed one.
- JTBD: "When I try a strategy I read about, I want to see the payoff picture before any
  real order form, so I can learn without risking a mistake."
- Pains: multi-leg tickets are intimidating; no consequence-free rehearsal space; education
  content and trading tools live in different products.

## Top insights -> requirements

| Insight | Requirement |
| --- | --- |
| Risk shape must be visible during construction, not after | Payoff chart, max P/L, breakevens update live in the builder |
| Templates are the entry point; custom legs are the power tool | 9 named templates plus a full leg editor |
| Trust requires seeing the same numbers a broker shows | Per-leg and aggregate Greeks, bid/ask/mid on every quote |
| Rehearsal beats tutorials | Simulated order flow with confirmations and history |

## Out of scope for v1 (see roadmap.md for reasons)

Live market data, positions P&L over time, margin modeling, futures, calendars/diagonals.
```

- [ ] **Step 2: Write `docs/product/success-metrics.md`**

```markdown
# Success Metrics and Tracking Plan

Date: 2026-07-06
Format: Amplitude-style tracking plan. Event names are snake_case and are the single
source of truth: code must use these exact strings.

## North star

Analyzed strategies per session: sessions where a trader sees the full risk picture
(payoff, max loss, breakevens) of a strategy they built.

## Activation funnel (per session)

1. `chain_viewed` - trader opened an option chain
2. strategy built - first `template_selected` or `leg_edited` in the session
3. `strategy_analyzed` - analysis panel rendered with at least one leg
4. `order_placed` - simulated order confirmed

Target shape for a healthy funnel (from seed baseline): 100% / 60% / 45% / 15%.

## Event dictionary

| Event | Trigger | Properties |
| --- | --- | --- |
| `page_view` | route mounted | `path` |
| `chain_viewed` | underlying selected or changed | `underlying` |
| `template_selected` | template applied to builder | `template`, `underlying` |
| `leg_edited` | leg added, updated, or removed | `action` (add/update/remove), `legs` (count) |
| `strategy_analyzed` | analysis panel rendered with >= 1 leg (debounced 800ms) | `underlying`, `legs`, `template` (if any) |
| `order_ticket_opened` | ticket modal opened | `underlying`, `legs` |
| `order_placed` | simulated order confirmed | `underlying`, `legs`, `net_premium` |
| `strategy_saved` | strategy saved to list | `underlying`, `legs` |

## Implementation notes

- Events persist to localStorage (`spread-studio:events`), capped at 2000, `source: 'live'`.
- Session id: `crypto.randomUUID()` stored in sessionStorage.
- The /analytics dashboard merges a deterministic seeded dataset (`source: 'seed'`,
  generated in lib/analytics/seed.ts) with live events, and labels them separately.
- v2 wires these same events to a real Amplitude project (see roadmap).

## Guardrails

- No PII exists in the product; events must never include free-text input.
- Event volume cap prevents unbounded localStorage growth.
```

- [ ] **Step 3: Write `docs/product/roadmap.md`**

```markdown
# Roadmap

Date: 2026-07-06

## v1 (this repo): Strategy Builder MVP

Synthetic chains, 9 templates, custom leg editor, live risk analysis, simulated order
flow, usage analytics dashboard. Success = the full journey works in the live demo with
CI green.

## v2: Data and measurement

- Live delayed market data behind a provider adapter (interface already isolated in
  lib/chains). Deferred from v1 because API keys and rate limits make demos fragile, and
  synthetic data proves the product logic just as well.
- Real Amplitude destination for the existing event taxonomy. Deferred because the
  tracking plan and funnel math are the PM deliverable; the vendor wiring is plumbing.
- Positions and P&L over time (mark-to-model). Deferred because it requires a persistence
  and pricing-refresh model that would double v1 scope.

## v3: Breadth

- Futures chains and futures options (margin/tick conventions differ enough to be their
  own spec).
- Calendars and diagonals: requires multi-expiration payoff modeling (value of the far
  leg at near expiration), which needs a pricing model at evaluation time, not just
  intrinsic value.
- Margin and buying-power modeling per strategy.
- Alerts and mobile layout.

Each item graduates by getting its own spec under specs/NNN-name/ before any code.
```

- [ ] **Step 4: Commit**

```powershell
git add docs/product
git commit -m "docs: add discovery brief, tracking plan, and roadmap"
```

### Task 4: /speckit.specify

**Files:**
- Create (generated): `specs/001-*/spec.md` (Spec Kit will create a numbered feature dir and a branch)

**Interfaces:**
- Produces: the feature branch (likely `001-options-strategy-builder`; note the actual name) and `spec.md`. All later work happens on this branch until Task 24 merges it.

- [ ] **Step 1: Run `/speckit.specify`** with exactly this argument text:

```text
Build Spread Studio, a multi-leg options strategy builder for active traders, as a
client-only web app with deterministic synthetic market data.

Users: active options traders (income sellers, defined-risk spread traders, learners).
Source: docs/product/discovery-brief.md.

User stories:
- As a trader, I select one of 8 synthetic underlyings and see its option chain (4 fixed
  expirations, 21 strikes each, bid/ask/mid, IV, delta) so I can explore candidates.
- As a trader, I apply one of 9 strategy templates (long call, long put, covered call,
  cash secured put, bull call spread, bear put spread, iron condor, long straddle, long
  strangle) and get sensible legs picked relative to at-the-money.
- As a trader, I add, edit, and remove individual legs (call/put/stock, buy/sell,
  quantity, strike) with all option legs sharing one strategy-level expiration.
- As a trader, I always see the live risk picture of my current legs: payoff-at-expiration
  chart, breakevens, max profit, max loss, net debit or credit, per-leg and aggregate
  Greeks (delta, gamma, theta per day, vega per vol point).
- As a trader, I open a simulated order ticket, confirm a mid-price fill, and see the
  order in an orders history page. I can save strategies and reload them.
- As a product manager, I open /analytics and see the activation funnel (chain viewed,
  strategy built, strategy analyzed, order placed), template popularity, and my own live
  session events, per the tracking plan in docs/product/success-metrics.md.

Constraints: no external APIs, no database, no auth; all market data generated from a
fixed market date of 2026-07-06 with Black-Scholes pricing and a volatility skew;
localStorage persistence only; dark broker-grade UI.

Out of scope for v1: live data, positions P&L, margin, futures, multi-expiration
strategies (calendars/diagonals). These are documented in docs/product/roadmap.md.
```

- [ ] **Step 2: Curate the generated `spec.md`**

Open `specs/001-*/spec.md` and verify against this checklist, editing the file directly to fix gaps:
- All 9 templates named exactly as listed above.
- The single-expiration-per-strategy constraint stated.
- The event names match `docs/product/success-metrics.md` verbatim.
- Determinism constraint (fixed market date, no network) present.
- Out-of-scope list present.
- No `[NEEDS CLARIFICATION]` markers remain; resolve each using the design spec at `docs/superpowers/specs/2026-07-06-spread-studio-design.md`.

- [ ] **Step 3: Commit (on the feature branch Spec Kit created)**

```powershell
git add specs
git commit -m "docs: product spec for options strategy builder (speckit.specify)"
```

### Task 5: /speckit.plan

**Files:**
- Create (generated): `specs/001-*/plan.md` and any research/data-model files Spec Kit emits

**Interfaces:**
- Produces: `plan.md` matching the architecture below (later tasks implement exactly this module layout).

- [ ] **Step 1: Run `/speckit.plan`** with exactly this argument text:

```text
Tech stack: Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS v4, Zustand
for builder state, Recharts for the payoff chart, Vitest for unit tests, Playwright for
end-to-end tests, GitHub Actions CI, Vercel hosting.

Architecture: all domain logic in pure dependency-free TypeScript modules under lib/,
imported by client components. No API routes, no server persistence.
- lib/types.ts: shared domain types (Underlying, OptionQuote, Greeks, Leg, Strategy,
  Order, AnalyticsEvent, EventName)
- lib/market/constants.ts: MARKET_DATE '2026-07-06', RISK_FREE_RATE 0.04, 4 fixed
  expiration dates, 8 synthetic underlyings
- lib/pricing/blackScholes.ts: normCdf, priceOption returning price plus delta, gamma,
  theta per day, vega per vol point
- lib/chains/generate.ts: deterministic chain generation, strike ladder (21 strikes),
  volatility skew, bid/ask around Black-Scholes mid
- lib/payoff/payoff.ts: per-leg and strategy P/L at expiration, breakevens, max
  profit/loss with unlimited detection via asymptotic slope, net premium
- lib/strategies/templates.ts: 9 templates building legs from a chain relative to ATM
- lib/analytics/: events.ts (track), store.ts (localStorage), funnel.ts (stage
  aggregation), seed.ts (deterministic demo dataset, mulberry32 PRNG)
- lib/persist/: orders.ts, strategies.ts (localStorage CRUD)
- lib/state/builder.ts: Zustand store for underlying, expiration, legs, template
- app/: page.tsx (builder), orders/page.tsx, analytics/page.tsx, layout.tsx
- components/: UnderlyingPicker, ExpirationTabs, ChainTable, TemplatePicker, LegEditor,
  AnalysisPanel, PayoffChart, MetricsGrid, GreeksTable, OrderTicketModal, Nav
- tests/unit/*.test.ts (Vitest), tests/e2e/journey.spec.ts (Playwright with dev-server
  webServer config)

Testing policy: TDD with reference values for pricing/payoff math; one Playwright journey
covering pick underlying -> apply iron condor -> verify max loss -> place order -> orders
history -> analytics funnel.
```

- [ ] **Step 2: Curate `plan.md`**: verify the module list above survived intact, edit directly if not. Remove placeholder sections Spec Kit left empty.

- [ ] **Step 3: Commit**

```powershell
git add specs
git commit -m "docs: technical plan (speckit.plan)"
```

### Task 6: /speckit.tasks

**Files:**
- Create (generated): `specs/001-*/tasks.md`

**Interfaces:**
- Produces: Spec Kit task IDs (T001...) referenced in later commit bodies.

- [ ] **Step 1: Run `/speckit.tasks`** (no extra arguments needed).

- [ ] **Step 2: Curate `tasks.md`**: confirm tasks roughly mirror Phases B-D of this plan (domain libs, UI, e2e, CI, deploy). Do not force a 1:1 match; add missing items, delete hallucinated ones (anything requiring a database or external API violates the constitution).

- [ ] **Step 3: Commit**

```powershell
git add specs
git commit -m "docs: implementation task list (speckit.tasks)"
```

From now on: when a commit implements a Spec Kit task, add `Implements: T0NN` to the commit body, and tick the checkbox in `tasks.md` in the same commit.

---

## Phase B: App scaffold and domain libraries (TDD)

### Task 7: Next.js scaffold and test tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `vitest.config.ts`, `playwright.config.ts`, `next-env.d.ts` (generated)

**Interfaces:**
- Produces: `npm run dev|build|test|test:e2e` scripts; `@/*` path alias for all imports.

Scaffold manually (not create-next-app) so nothing conflicts with the existing docs and specs directories.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "spread-studio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`**

```ts
// next.config.ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {};
export default nextConfig;
```

```js
// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } };
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Write the minimal app shell**

```css
/* app/globals.css */
@import 'tailwindcss';

:root { color-scheme: dark; }
body { @apply bg-zinc-950 text-zinc-200 antialiased; }
.num { @apply tabular-nums text-right; }
```

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spread Studio',
  description: 'Multi-leg options strategy builder with simulated market data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function BuilderPage() {
  return <main className="p-6">Spread Studio</main>;
}
```

- [ ] **Step 5: Install and verify**

```powershell
npm install
npx playwright install chromium
npm run build
```

Expected: build succeeds. Then `npm run dev`, open http://localhost:3000, confirm the dark page renders, stop the server.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and Playwright tooling"
```

### Task 8: Domain types and Black-Scholes pricing

**Files:**
- Create: `lib/types.ts`, `lib/market/constants.ts`, `lib/pricing/blackScholes.ts`, `lib/util.ts`
- Test: `tests/unit/pricing.test.ts`

**Interfaces:**
- Produces: all shared types below (used verbatim by every later task) and `priceOption(type, S, K, T, sigma, r?): { price: number; greeks: Greeks }` with theta per calendar day and vega per 1 vol point.

- [ ] **Step 1: Write `lib/types.ts` and `lib/market/constants.ts`** (types first; they cannot be tested but pricing tests import them)

```ts
// lib/types.ts
export type OptionType = 'call' | 'put';
export type LegKind = OptionType | 'stock';
export type Side = 'buy' | 'sell';

export interface Underlying {
  symbol: string;
  name: string;
  spot: number;
  baseVol: number;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number; // per calendar day
  vega: number; // per 1 vol point (1%)
}

export interface OptionQuote {
  underlying: string;
  type: OptionType;
  strike: number;
  expiration: string; // ISO date
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  greeks: Greeks;
}

export interface Leg {
  kind: LegKind;
  side: Side;
  strike: number; // 0 for stock
  expiration: string; // '' for stock
  quantity: number; // contracts; for stock, lots of 100 shares
  price: number; // per-share premium at mid; for stock, spot when added
}

export interface Strategy {
  id: string;
  name: string;
  underlying: string;
  legs: Leg[];
  createdAt: string;
}

export interface Order {
  id: string;
  underlying: string;
  strategyName: string;
  legs: Leg[];
  netPremium: number; // dollars; >0 debit, <0 credit
  placedAt: string;
}

export type EventName =
  | 'page_view'
  | 'chain_viewed'
  | 'template_selected'
  | 'leg_edited'
  | 'strategy_analyzed'
  | 'order_ticket_opened'
  | 'order_placed'
  | 'strategy_saved';

export interface AnalyticsEvent {
  name: EventName;
  sessionId: string;
  timestamp: string;
  source: 'seed' | 'live';
  properties?: Record<string, string | number>;
}
```

```ts
// lib/market/constants.ts
import type { Underlying } from '@/lib/types';

export const MARKET_DATE = '2026-07-06';
export const RISK_FREE_RATE = 0.04;
export const EXPIRATIONS = ['2026-07-17', '2026-07-31', '2026-08-21', '2026-09-18'];

export const UNDERLYINGS: Underlying[] = [
  { symbol: 'AURA', name: 'Aurora Compute', spot: 187.45, baseVol: 0.38 },
  { symbol: 'BOLT', name: 'Bolt Mobility', spot: 42.18, baseVol: 0.55 },
  { symbol: 'CRSN', name: 'Corsen Energy', spot: 78.6, baseVol: 0.33 },
  { symbol: 'DUNE', name: 'Dune Materials', spot: 23.75, baseVol: 0.48 },
  { symbol: 'EMBR', name: 'Ember Biotech', spot: 64.2, baseVol: 0.72 },
  { symbol: 'FLUX', name: 'Flux Financial', spot: 112.9, baseVol: 0.27 },
  { symbol: 'GLDE', name: 'Glide Air', spot: 31.4, baseVol: 0.44 },
  { symbol: 'VLTX', name: 'Voltex 500 Index', spot: 5127.5, baseVol: 0.16 },
];
```

```ts
// lib/util.ts
export const round2 = (x: number) => Math.round(x * 100) / 100;

export const fmtUsd = (x: number) =>
  Number.isFinite(x)
    ? x.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : 'Unlimited';
```

- [ ] **Step 2: Write the failing pricing test**

```ts
// tests/unit/pricing.test.ts
import { describe, expect, it } from 'vitest';
import { normCdf, priceOption } from '@/lib/pricing/blackScholes';

// Reference values: S=100, K=100, T=1, r=0.05, sigma=0.20 (standard textbook case)
describe('Black-Scholes', () => {
  it('normCdf matches known values', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 6);
    expect(normCdf(0.35)).toBeCloseTo(0.63683, 5);
    expect(normCdf(-1.96)).toBeCloseTo(0.024998, 5);
  });

  it('prices the reference call', () => {
    const { price, greeks } = priceOption('call', 100, 100, 1, 0.2, 0.05);
    expect(price).toBeCloseTo(10.4506, 3);
    expect(greeks.delta).toBeCloseTo(0.6368, 4);
    expect(greeks.gamma).toBeCloseTo(0.018762, 5);
    expect(greeks.vega).toBeCloseTo(0.37524, 4); // per 1 vol point
    expect(greeks.theta).toBeCloseTo(-6.414 / 365, 4); // per day
  });

  it('prices the reference put and satisfies put-call parity', () => {
    const call = priceOption('call', 100, 100, 1, 0.2, 0.05);
    const put = priceOption('put', 100, 100, 1, 0.2, 0.05);
    expect(put.price).toBeCloseTo(5.5735, 3);
    expect(put.greeks.delta).toBeCloseTo(call.greeks.delta - 1, 6);
    // parity: C - P = S - K e^(-rT)
    expect(call.price - put.price).toBeCloseTo(100 - 100 * Math.exp(-0.05), 4);
  });

  it('returns intrinsic value at expiration', () => {
    expect(priceOption('call', 110, 100, 0, 0.2).price).toBe(10);
    expect(priceOption('put', 90, 100, 0, 0.2).price).toBe(10);
    expect(priceOption('call', 90, 100, 0, 0.2).price).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/pricing.test.ts`
Expected: FAIL, cannot resolve `@/lib/pricing/blackScholes`.

- [ ] **Step 4: Write `lib/pricing/blackScholes.ts`**

```ts
import { RISK_FREE_RATE } from '@/lib/market/constants';
import type { Greeks, OptionType } from '@/lib/types';

// Abramowitz & Stegun 26.2.17, |error| < 7.5e-8
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

export interface OptionPricing {
  price: number;
  greeks: Greeks;
}

export function priceOption(
  type: OptionType,
  S: number,
  K: number,
  T: number,
  sigma: number,
  r: number = RISK_FREE_RATE,
): OptionPricing {
  if (T <= 0 || sigma <= 0) {
    const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
    const delta = type === 'call' ? (S > K ? 1 : 0) : S < K ? -1 : 0;
    return { price: intrinsic, greeks: { delta, gamma: 0, theta: 0, vega: 0 } };
  }
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const pdf = Math.exp((-d1 * d1) / 2) / Math.sqrt(2 * Math.PI);
  const discK = K * Math.exp(-r * T);
  const price =
    type === 'call'
      ? S * normCdf(d1) - discK * normCdf(d2)
      : discK * normCdf(-d2) - S * normCdf(-d1);
  const delta = type === 'call' ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = pdf / (S * sigma * sqrtT);
  const vega = (S * pdf * sqrtT) / 100;
  const thetaYear =
    type === 'call'
      ? -(S * pdf * sigma) / (2 * sqrtT) - r * discK * normCdf(d2)
      : -(S * pdf * sigma) / (2 * sqrtT) + r * discK * normCdf(-d2);
  return { price, greeks: { delta, gamma, theta: thetaYear / 365, vega } };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/pricing.test.ts`
Expected: PASS (all 4 tests).

- [ ] **Step 6: Commit**

```powershell
git add lib tests
git commit -m "feat: domain types, market constants, Black-Scholes pricing with Greeks"
```

### Task 9: Synthetic chain generation

**Files:**
- Create: `lib/chains/generate.ts`
- Test: `tests/unit/chains.test.ts`

**Interfaces:**
- Consumes: `priceOption` (Task 8), constants (Task 8).
- Produces: `generateChain(underlying: Underlying, expiration: string): OptionQuote[]` (21 strikes x call+put = 42 quotes, sorted by strike), `strikeStep(spot: number): number`, `yearsToExpiration(expiration: string): number`, `impliedVol(baseVol, strike, spot, expIndex): number`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/chains.test.ts
import { describe, expect, it } from 'vitest';
import { generateChain, strikeStep, yearsToExpiration } from '@/lib/chains/generate';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';

const aura = UNDERLYINGS.find((u) => u.symbol === 'AURA')!;

describe('chain generation', () => {
  it('is deterministic', () => {
    expect(generateChain(aura, EXPIRATIONS[0])).toEqual(generateChain(aura, EXPIRATIONS[0]));
  });

  it('produces 21 strikes with call and put per strike', () => {
    const chain = generateChain(aura, EXPIRATIONS[0]);
    expect(chain).toHaveLength(42);
    const strikes = [...new Set(chain.map((q) => q.strike))];
    expect(strikes).toHaveLength(21);
  });

  it('has sane quote structure', () => {
    for (const q of generateChain(aura, EXPIRATIONS[1])) {
      expect(q.bid).toBeGreaterThanOrEqual(0);
      expect(q.bid).toBeLessThanOrEqual(q.mid);
      expect(q.ask).toBeGreaterThanOrEqual(q.mid);
      expect(q.iv).toBeGreaterThan(0);
    }
  });

  it('call mids decrease and put mids increase with strike', () => {
    const chain = generateChain(aura, EXPIRATIONS[2]);
    const calls = chain.filter((q) => q.type === 'call').sort((a, b) => a.strike - b.strike);
    const puts = chain.filter((q) => q.type === 'put').sort((a, b) => a.strike - b.strike);
    for (let i = 1; i < calls.length; i++) {
      expect(calls[i].mid).toBeLessThanOrEqual(calls[i - 1].mid);
      expect(puts[i].mid).toBeGreaterThanOrEqual(puts[i - 1].mid);
    }
  });

  it('shows a volatility smile (wings above the money)', () => {
    const chain = generateChain(aura, EXPIRATIONS[0]);
    const calls = chain.filter((q) => q.type === 'call').sort((a, b) => a.strike - b.strike);
    const atm = calls[Math.floor(calls.length / 2)];
    expect(calls[0].iv).toBeGreaterThan(atm.iv); // low strike wing
  });

  it('computes strike steps by spot magnitude', () => {
    expect(strikeStep(23.75)).toBe(1);
    expect(strikeStep(187.45)).toBe(5);
    expect(strikeStep(5127.5)).toBe(25);
  });

  it('computes time to expiration from the fixed market date', () => {
    expect(yearsToExpiration('2026-07-17')).toBeCloseTo(11 / 365, 6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/chains.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/chains/generate.ts`**

```ts
import { EXPIRATIONS, MARKET_DATE } from '@/lib/market/constants';
import { priceOption } from '@/lib/pricing/blackScholes';
import type { OptionQuote, Underlying } from '@/lib/types';
import { round2 } from '@/lib/util';

export function yearsToExpiration(expiration: string): number {
  const ms = Date.parse(`${expiration}T16:00:00Z`) - Date.parse(`${MARKET_DATE}T16:00:00Z`);
  return ms / (365 * 24 * 3600 * 1000);
}

export function strikeStep(spot: number): number {
  if (spot < 50) return 1;
  if (spot < 200) return 5;
  if (spot < 1000) return 10;
  return 25;
}

export function impliedVol(
  baseVol: number,
  strike: number,
  spot: number,
  expIndex: number,
): number {
  const m = strike / spot - 1;
  return Math.max(0.08, baseVol * (1 - 0.25 * m + 1.2 * m * m) + expIndex * 0.008);
}

export function generateChain(underlying: Underlying, expiration: string): OptionQuote[] {
  const expIndex = Math.max(0, EXPIRATIONS.indexOf(expiration));
  const T = yearsToExpiration(expiration);
  const step = strikeStep(underlying.spot);
  const center = Math.round(underlying.spot / step) * step;
  const quotes: OptionQuote[] = [];
  for (let i = -10; i <= 10; i++) {
    const strike = center + i * step;
    if (strike <= 0) continue;
    const iv = impliedVol(underlying.baseVol, strike, underlying.spot, expIndex);
    for (const type of ['call', 'put'] as const) {
      const { price, greeks } = priceOption(type, underlying.spot, strike, T, iv);
      const mid = round2(price);
      const half = Math.max(0.03, mid * 0.02);
      quotes.push({
        underlying: underlying.symbol,
        type,
        strike,
        expiration,
        bid: Math.max(0, round2(mid - half)),
        ask: round2(mid + half),
        mid,
        iv,
        greeks,
      });
    }
  }
  return quotes.sort((a, b) => a.strike - b.strike);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/chains.test.ts`
Expected: PASS. If the monotonicity test fails by a cent from rounding, compare with tolerance instead: change to `expect(calls[i].mid).toBeLessThanOrEqual(calls[i - 1].mid + 0.01)` (and mirror for puts). Do not weaken determinism or structure tests.

- [ ] **Step 5: Commit**

```powershell
git add lib tests
git commit -m "feat: deterministic synthetic option chain generation with vol skew"
```

### Task 10: Payoff analysis

**Files:**
- Create: `lib/payoff/payoff.ts`
- Test: `tests/unit/payoff.test.ts`

**Interfaces:**
- Consumes: `Leg`, `Side` types.
- Produces:
  - `legPlAtExpiration(leg: Leg, S: number): number`
  - `strategyPlAtExpiration(legs: Leg[], S: number): number`
  - `netPremium(legs: Leg[]): number` (dollars, >0 debit)
  - `analyzePayoff(legs: Leg[], spot: number): PayoffAnalysis` where `PayoffAnalysis = { points: { price: number; pl: number }[]; breakevens: number[]; maxProfit: number; maxLoss: number; netPremium: number }` with `Infinity` / `-Infinity` for unlimited.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/payoff.test.ts
import { describe, expect, it } from 'vitest';
import { analyzePayoff, netPremium, strategyPlAtExpiration } from '@/lib/payoff/payoff';
import type { Leg } from '@/lib/types';

const leg = (partial: Partial<Leg>): Leg => ({
  kind: 'call',
  side: 'buy',
  strike: 100,
  expiration: '2026-07-17',
  quantity: 1,
  price: 1,
  ...partial,
});

describe('payoff analysis', () => {
  it('bull call spread 100/105 for 2.00 debit', () => {
    const legs = [
      leg({ kind: 'call', side: 'buy', strike: 100, price: 3 }),
      leg({ kind: 'call', side: 'sell', strike: 105, price: 1 }),
    ];
    const a = analyzePayoff(legs, 100);
    expect(a.netPremium).toBeCloseTo(200, 2);
    expect(a.maxProfit).toBeCloseTo(300, 2);
    expect(a.maxLoss).toBeCloseTo(-200, 2);
    expect(a.breakevens).toHaveLength(1);
    expect(a.breakevens[0]).toBeCloseTo(102, 1);
  });

  it('iron condor 90/95/105/110 for 2.00 credit', () => {
    const legs = [
      leg({ kind: 'put', side: 'buy', strike: 90, price: 1 }),
      leg({ kind: 'put', side: 'sell', strike: 95, price: 2 }),
      leg({ kind: 'call', side: 'sell', strike: 105, price: 2 }),
      leg({ kind: 'call', side: 'buy', strike: 110, price: 1 }),
    ];
    const a = analyzePayoff(legs, 100);
    expect(a.netPremium).toBeCloseTo(-200, 2);
    expect(a.maxProfit).toBeCloseTo(200, 2);
    expect(a.maxLoss).toBeCloseTo(-300, 2);
    expect(a.breakevens.map((b) => Math.round(b)).sort((x, y) => x - y)).toEqual([93, 107]);
  });

  it('long call has unlimited profit and premium-capped loss', () => {
    const a = analyzePayoff([leg({ side: 'buy', strike: 100, price: 3 })], 100);
    expect(a.maxProfit).toBe(Infinity);
    expect(a.maxLoss).toBeCloseTo(-300, 2);
  });

  it('short strangle has unlimited loss', () => {
    const legs = [
      leg({ kind: 'put', side: 'sell', strike: 90, price: 2 }),
      leg({ kind: 'call', side: 'sell', strike: 110, price: 2 }),
    ];
    const a = analyzePayoff(legs, 100);
    expect(a.maxLoss).toBe(-Infinity);
    expect(a.maxProfit).toBeCloseTo(400, 2);
  });

  it('covered call caps upside and carries stock downside', () => {
    const legs = [
      leg({ kind: 'stock', side: 'buy', strike: 0, expiration: '', price: 100 }),
      leg({ kind: 'call', side: 'sell', strike: 105, price: 2 }),
    ];
    const a = analyzePayoff(legs, 100);
    expect(a.maxProfit).toBeCloseTo(700, 2); // (105-100)*100 + 200
    expect(a.maxLoss).toBeCloseTo(-9800, 2); // stock to zero minus premium
    expect(a.breakevens[0]).toBeCloseTo(98, 1);
    expect(strategyPlAtExpiration(legs, 120)).toBeCloseTo(700, 2);
  });

  it('netPremium signs: buy pays, sell collects', () => {
    expect(netPremium([leg({ side: 'buy', price: 2.5 })])).toBeCloseTo(250, 2);
    expect(netPremium([leg({ side: 'sell', price: 2.5 })])).toBeCloseTo(-250, 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/payoff.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/payoff/payoff.ts`**

```ts
import type { Leg, Side } from '@/lib/types';
import { round2 } from '@/lib/util';

export interface PayoffPoint {
  price: number;
  pl: number;
}

export interface PayoffAnalysis {
  points: PayoffPoint[];
  breakevens: number[];
  maxProfit: number;
  maxLoss: number;
  netPremium: number;
}

const sign = (s: Side) => (s === 'buy' ? 1 : -1);

export function legPlAtExpiration(leg: Leg, S: number): number {
  if (leg.kind === 'stock') return sign(leg.side) * (S - leg.price) * 100 * leg.quantity;
  const intrinsic =
    leg.kind === 'call' ? Math.max(S - leg.strike, 0) : Math.max(leg.strike - S, 0);
  return sign(leg.side) * (intrinsic - leg.price) * 100 * leg.quantity;
}

export function strategyPlAtExpiration(legs: Leg[], S: number): number {
  return legs.reduce((sum, l) => sum + legPlAtExpiration(l, S), 0);
}

export function netPremium(legs: Leg[]): number {
  return legs.reduce((sum, l) => sum + sign(l.side) * l.price * 100 * l.quantity, 0);
}

export function analyzePayoff(legs: Leg[], spot: number): PayoffAnalysis {
  const strikes = legs.filter((l) => l.kind !== 'stock').map((l) => l.strike);
  const anchors = strikes.length ? strikes : [spot];
  const lo = Math.max(0, Math.min(...anchors, spot) * 0.5);
  const hi = Math.max(...anchors, spot) * 1.5;
  const N = 400;
  const step = (hi - lo) / N;

  const points: PayoffPoint[] = [];
  for (let i = 0; i <= N; i++) {
    const price = lo + i * step;
    points.push({ price: round2(price), pl: round2(strategyPlAtExpiration(legs, price)) });
  }

  // P/L is piecewise linear in S; extrema occur at strikes and boundaries.
  const evalPoints = [...strikes, 0, hi];
  let maxProfit = -Infinity;
  let maxLoss = Infinity;
  for (const s of evalPoints) {
    const pl = strategyPlAtExpiration(legs, s);
    maxProfit = Math.max(maxProfit, pl);
    maxLoss = Math.min(maxLoss, pl);
  }
  // Slope above the highest strike decides unlimited upside/downside.
  const upSlope = legs.reduce(
    (s, l) => s + sign(l.side) * l.quantity * (l.kind === 'put' ? 0 : 1),
    0,
  );
  if (upSlope > 0) maxProfit = Infinity;
  if (upSlope < 0) maxLoss = -Infinity;

  const breakevens: number[] = [];
  for (let i = 1; i <= N; i++) {
    const a = strategyPlAtExpiration(legs, lo + (i - 1) * step);
    const b = strategyPlAtExpiration(legs, lo + i * step);
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      const t = Math.abs(a) / (Math.abs(a) + Math.abs(b));
      const be = round2(lo + (i - 1) * step + t * step);
      if (!breakevens.some((x) => Math.abs(x - be) < 0.02)) breakevens.push(be);
    }
  }

  return {
    points,
    breakevens,
    maxProfit: round2(maxProfit),
    maxLoss: round2(maxLoss),
    netPremium: round2(netPremium(legs)),
  };
}
```

Note: `round2(Infinity)` is `Infinity` via `Math.round`; leave as is.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/payoff.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```powershell
git add lib tests
git commit -m "feat: payoff analysis with breakevens, max P/L, and unlimited detection"
```

### Task 11: Strategy templates

**Files:**
- Create: `lib/strategies/templates.ts`
- Test: `tests/unit/templates.test.ts`

**Interfaces:**
- Consumes: `OptionQuote`, `Underlying`, `Leg`; `generateChain` in tests.
- Produces: `TemplateId` union, `TEMPLATES: StrategyTemplate[]` where `StrategyTemplate = { id: TemplateId; name: string; description: string; build(chain: OptionQuote[], underlying: Underlying): Leg[] }`, and `getTemplate(id: TemplateId): StrategyTemplate`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/templates.test.ts
import { describe, expect, it } from 'vitest';
import { generateChain } from '@/lib/chains/generate';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';
import { analyzePayoff } from '@/lib/payoff/payoff';
import { TEMPLATES, getTemplate } from '@/lib/strategies/templates';

const aura = UNDERLYINGS[0];
const chain = generateChain(aura, EXPIRATIONS[1]);

describe('strategy templates', () => {
  it('exposes exactly the 9 spec templates', () => {
    expect(TEMPLATES.map((t) => t.id).sort()).toEqual(
      [
        'bear_put_spread',
        'bull_call_spread',
        'cash_secured_put',
        'covered_call',
        'iron_condor',
        'long_call',
        'long_put',
        'long_straddle',
        'long_strangle',
      ],
    );
  });

  it('every template builds legs priced from the chain', () => {
    for (const t of TEMPLATES) {
      const legs = t.build(chain, aura);
      expect(legs.length).toBeGreaterThan(0);
      for (const l of legs) {
        expect(l.quantity).toBe(1);
        expect(l.price).toBeGreaterThanOrEqual(0);
        if (l.kind !== 'stock') expect(l.expiration).toBe(EXPIRATIONS[1]);
      }
    }
  });

  it('iron condor is 4 option legs with a net credit and defined risk', () => {
    const legs = getTemplate('iron_condor').build(chain, aura);
    expect(legs).toHaveLength(4);
    const a = analyzePayoff(legs, aura.spot);
    expect(a.netPremium).toBeLessThan(0);
    expect(Number.isFinite(a.maxLoss)).toBe(true);
    expect(a.breakevens).toHaveLength(2);
  });

  it('covered call includes a stock leg and a short call above spot', () => {
    const legs = getTemplate('covered_call').build(chain, aura);
    expect(legs.some((l) => l.kind === 'stock' && l.side === 'buy')).toBe(true);
    const call = legs.find((l) => l.kind === 'call')!;
    expect(call.side).toBe('sell');
    expect(call.strike).toBeGreaterThan(aura.spot);
  });

  it('bull call spread buys ATM and sells higher strike', () => {
    const legs = getTemplate('bull_call_spread').build(chain, aura);
    const buy = legs.find((l) => l.side === 'buy')!;
    const sell = legs.find((l) => l.side === 'sell')!;
    expect(sell.strike).toBeGreaterThan(buy.strike);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/templates.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/strategies/templates.ts`**

```ts
import type { Leg, OptionQuote, OptionType, Side, Underlying } from '@/lib/types';

export type TemplateId =
  | 'long_call'
  | 'long_put'
  | 'covered_call'
  | 'cash_secured_put'
  | 'bull_call_spread'
  | 'bear_put_spread'
  | 'iron_condor'
  | 'long_straddle'
  | 'long_strangle';

export interface StrategyTemplate {
  id: TemplateId;
  name: string;
  description: string;
  build(chain: OptionQuote[], underlying: Underlying): Leg[];
}

function quotesOf(chain: OptionQuote[], type: OptionType): OptionQuote[] {
  return chain.filter((q) => q.type === type).sort((a, b) => a.strike - b.strike);
}

function atmIndex(quotes: OptionQuote[], spot: number): number {
  let best = 0;
  for (let i = 1; i < quotes.length; i++) {
    if (Math.abs(quotes[i].strike - spot) < Math.abs(quotes[best].strike - spot)) best = i;
  }
  return best;
}

function clamp(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

function optionLeg(q: OptionQuote, side: Side): Leg {
  return {
    kind: q.type,
    side,
    strike: q.strike,
    expiration: q.expiration,
    quantity: 1,
    price: q.mid,
  };
}

function stockLeg(u: Underlying, side: Side): Leg {
  return { kind: 'stock', side, strike: 0, expiration: '', quantity: 1, price: u.spot };
}

// pick(type, offset): quote `offset` strike steps from ATM (positive = higher strike)
function picker(chain: OptionQuote[], spot: number) {
  return (type: OptionType, offset: number): OptionQuote => {
    const qs = quotesOf(chain, type);
    return qs[clamp(atmIndex(qs, spot) + offset, qs.length)];
  };
}

export const TEMPLATES: StrategyTemplate[] = [
  {
    id: 'long_call',
    name: 'Long Call',
    description: 'Bullish. Buy a call one strike above the money.',
    build: (c, u) => [optionLeg(picker(c, u.spot)('call', 1), 'buy')],
  },
  {
    id: 'long_put',
    name: 'Long Put',
    description: 'Bearish. Buy a put one strike below the money.',
    build: (c, u) => [optionLeg(picker(c, u.spot)('put', -1), 'buy')],
  },
  {
    id: 'covered_call',
    name: 'Covered Call',
    description: 'Income. Long stock plus a short call above the money.',
    build: (c, u) => [stockLeg(u, 'buy'), optionLeg(picker(c, u.spot)('call', 2), 'sell')],
  },
  {
    id: 'cash_secured_put',
    name: 'Cash-Secured Put',
    description: 'Income. Sell a put below the money, secured by cash.',
    build: (c, u) => [optionLeg(picker(c, u.spot)('put', -2), 'sell')],
  },
  {
    id: 'bull_call_spread',
    name: 'Bull Call Spread',
    description: 'Defined-risk bullish vertical.',
    build: (c, u) => {
      const pick = picker(c, u.spot);
      return [optionLeg(pick('call', 0), 'buy'), optionLeg(pick('call', 2), 'sell')];
    },
  },
  {
    id: 'bear_put_spread',
    name: 'Bear Put Spread',
    description: 'Defined-risk bearish vertical.',
    build: (c, u) => {
      const pick = picker(c, u.spot);
      return [optionLeg(pick('put', 0), 'buy'), optionLeg(pick('put', -2), 'sell')];
    },
  },
  {
    id: 'iron_condor',
    name: 'Iron Condor',
    description: 'Neutral. Sell an OTM put spread and an OTM call spread.',
    build: (c, u) => {
      const pick = picker(c, u.spot);
      return [
        optionLeg(pick('put', -4), 'buy'),
        optionLeg(pick('put', -2), 'sell'),
        optionLeg(pick('call', 2), 'sell'),
        optionLeg(pick('call', 4), 'buy'),
      ];
    },
  },
  {
    id: 'long_straddle',
    name: 'Long Straddle',
    description: 'Volatility. Buy the ATM call and put.',
    build: (c, u) => {
      const pick = picker(c, u.spot);
      return [optionLeg(pick('call', 0), 'buy'), optionLeg(pick('put', 0), 'buy')];
    },
  },
  {
    id: 'long_strangle',
    name: 'Long Strangle',
    description: 'Volatility. Buy an OTM call and an OTM put.',
    build: (c, u) => {
      const pick = picker(c, u.spot);
      return [optionLeg(pick('call', 2), 'buy'), optionLeg(pick('put', -2), 'buy')];
    },
  },
];

export function getTemplate(id: TemplateId): StrategyTemplate {
  return TEMPLATES.find((t) => t.id === id)!;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/templates.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```powershell
git add lib tests
git commit -m "feat: nine strategy templates with ATM-relative leg selection"
```

### Task 12: Analytics library (events, store, funnel, seed)

**Files:**
- Create: `lib/analytics/store.ts`, `lib/analytics/funnel.ts`, `lib/analytics/seed.ts`
- Test: `tests/unit/analytics.test.ts`

**Interfaces:**
- Consumes: `AnalyticsEvent`, `EventName`, `MARKET_DATE`.
- Produces:
  - `track(name: EventName, properties?: Record<string, string | number>): void` (SSR no-op)
  - `getLiveEvents(): AnalyticsEvent[]`, `getSessionId(): string`
  - `computeFunnel(events: AnalyticsEvent[]): FunnelStage[]` with `FunnelStage = { key: string; label: string; sessions: number }` and 4 stages: `chain_viewed`, `strategy_built`, `strategy_analyzed`, `order_placed`
  - `templatePopularity(events: AnalyticsEvent[]): { template: string; count: number }[]` sorted desc
  - `generateSeedEvents(): AnalyticsEvent[]` (deterministic, ~140 sessions over the 14 days before MARKET_DATE, funnel shape roughly 100/60/45/15 percent)
  - `countByName(events: AnalyticsEvent[]): Record<string, number>`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/analytics.test.ts
import { describe, expect, it } from 'vitest';
import { computeFunnel, countByName, templatePopularity } from '@/lib/analytics/funnel';
import { generateSeedEvents } from '@/lib/analytics/seed';
import type { AnalyticsEvent } from '@/lib/types';

const ev = (name: AnalyticsEvent['name'], sessionId: string, template?: string): AnalyticsEvent => ({
  name,
  sessionId,
  timestamp: '2026-07-01T12:00:00Z',
  source: 'seed',
  properties: template ? { template } : undefined,
});

describe('funnel aggregation', () => {
  it('counts unique sessions per stage', () => {
    const events = [
      ev('chain_viewed', 'a'),
      ev('chain_viewed', 'a'), // duplicate, same session
      ev('template_selected', 'a', 'iron_condor'),
      ev('strategy_analyzed', 'a'),
      ev('order_placed', 'a'),
      ev('chain_viewed', 'b'),
      ev('leg_edited', 'b'),
    ];
    const funnel = computeFunnel(events);
    expect(funnel.map((s) => s.key)).toEqual([
      'chain_viewed',
      'strategy_built',
      'strategy_analyzed',
      'order_placed',
    ]);
    expect(funnel.map((s) => s.sessions)).toEqual([2, 2, 1, 1]);
  });

  it('ranks template popularity', () => {
    const events = [
      ev('template_selected', 'a', 'iron_condor'),
      ev('template_selected', 'b', 'iron_condor'),
      ev('template_selected', 'c', 'long_call'),
    ];
    expect(templatePopularity(events)[0]).toEqual({ template: 'iron_condor', count: 2 });
  });
});

describe('seed dataset', () => {
  it('is deterministic', () => {
    expect(generateSeedEvents()).toEqual(generateSeedEvents());
  });

  it('has a plausible funnel shape', () => {
    const funnel = computeFunnel(generateSeedEvents());
    const [viewed, built, analyzed, placed] = funnel.map((s) => s.sessions);
    expect(viewed).toBeGreaterThanOrEqual(100);
    expect(built).toBeLessThan(viewed);
    expect(analyzed).toBeLessThan(built);
    expect(placed).toBeLessThan(analyzed);
    expect(placed).toBeGreaterThan(0);
  });

  it('timestamps fall in the 14 days before the market date', () => {
    for (const e of generateSeedEvents()) {
      expect(e.timestamp >= '2026-06-22').toBe(true);
      expect(e.timestamp <= '2026-07-06').toBe(true);
    }
  });

  it('counts events by name', () => {
    const counts = countByName([ev('chain_viewed', 'a'), ev('chain_viewed', 'b')]);
    expect(counts.chain_viewed).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/analytics.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Write the three modules**

```ts
// lib/analytics/funnel.ts
import type { AnalyticsEvent } from '@/lib/types';

export interface FunnelStage {
  key: string;
  label: string;
  sessions: number;
}

const STAGES: { key: string; label: string; match: (e: AnalyticsEvent) => boolean }[] = [
  { key: 'chain_viewed', label: 'Viewed a chain', match: (e) => e.name === 'chain_viewed' },
  {
    key: 'strategy_built',
    label: 'Built a strategy',
    match: (e) => e.name === 'template_selected' || e.name === 'leg_edited',
  },
  {
    key: 'strategy_analyzed',
    label: 'Analyzed risk',
    match: (e) => e.name === 'strategy_analyzed',
  },
  { key: 'order_placed', label: 'Placed an order', match: (e) => e.name === 'order_placed' },
];

export function computeFunnel(events: AnalyticsEvent[]): FunnelStage[] {
  return STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    sessions: new Set(events.filter(stage.match).map((e) => e.sessionId)).size,
  }));
}

export function templatePopularity(
  events: AnalyticsEvent[],
): { template: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.name !== 'template_selected') continue;
    const t = String(e.properties?.template ?? 'unknown');
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([template, count]) => ({ template, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByName(events: AnalyticsEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.name] = (counts[e.name] ?? 0) + 1;
  return counts;
}
```

```ts
// lib/analytics/seed.ts
import { TEMPLATES } from '@/lib/strategies/templates';
import { UNDERLYINGS } from '@/lib/market/constants';
import type { AnalyticsEvent } from '@/lib/types';

// mulberry32: tiny deterministic PRNG
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_START_MS = Date.parse('2026-06-22T13:30:00Z');
const DAY_MS = 24 * 3600 * 1000;

export function generateSeedEvents(): AnalyticsEvent[] {
  const rand = mulberry32(42);
  const events: AnalyticsEvent[] = [];
  const SESSIONS = 140;
  for (let i = 0; i < SESSIONS; i++) {
    const sessionId = `seed-${i}`;
    const dayOffset = Math.floor(rand() * 14);
    const base = SEED_START_MS + dayOffset * DAY_MS + Math.floor(rand() * 6 * 3600 * 1000);
    const at = (mins: number) => new Date(base + mins * 60_000).toISOString();
    const underlying = UNDERLYINGS[Math.floor(rand() * UNDERLYINGS.length)].symbol;
    const push = (name: AnalyticsEvent['name'], mins: number, props?: Record<string, string | number>) =>
      events.push({ name, sessionId, timestamp: at(mins), source: 'seed', properties: props });

    push('page_view', 0, { path: '/' });
    push('chain_viewed', 1, { underlying });
    if (rand() > 0.6) continue; // ~60% proceed to build
    const template = TEMPLATES[Math.floor(rand() ** 1.6 * TEMPLATES.length)].id;
    push('template_selected', 3, { template, underlying });
    push('leg_edited', 4, { action: 'add', legs: 2 });
    if (rand() > 0.75) continue; // ~75% of builders analyze
    push('strategy_analyzed', 5, { underlying, legs: 2, template });
    if (rand() > 0.34) continue; // ~34% of analyzers place
    push('order_ticket_opened', 7, { underlying, legs: 2 });
    push('order_placed', 8, { underlying, legs: 2, net_premium: Math.round(rand() * 400) });
  }
  return events;
}
```

```ts
// lib/analytics/store.ts
import type { AnalyticsEvent, EventName } from '@/lib/types';

const EVENTS_KEY = 'spread-studio:events';
const SESSION_KEY = 'spread-studio:session';
const MAX_EVENTS = 2000;

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getLiveEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export function track(name: EventName, properties?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  const events = getLiveEvents();
  events.push({
    name,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    source: 'live',
    properties,
  });
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/analytics.test.ts`
Expected: PASS. If the seed funnel shape assertion fails, tune the three `rand() > x` thresholds in `seed.ts`, never the test.

- [ ] **Step 5: Commit**

```powershell
git add lib tests
git commit -m "feat: analytics events, funnel aggregation, and seeded demo dataset"
```

### Task 13: Builder store and persistence

**Files:**
- Create: `lib/state/builder.ts`, `lib/persist/orders.ts`, `lib/persist/strategies.ts`
- Test: `tests/unit/builder.test.ts`

**Interfaces:**
- Consumes: `TEMPLATES`, `generateChain`, `track`.
- Produces:
  - Zustand store `useBuilder` with state `{ underlyingSymbol: string; expiration: string; legs: Leg[]; templateId: TemplateId | null }` and actions `setUnderlying(symbol)`, `setExpiration(exp)`, `applyTemplate(id)`, `addLegFromQuote(q: OptionQuote, side: Side)`, `updateLeg(index, patch: Partial<Leg>)`, `removeLeg(index)`, `clearLegs()`, `loadStrategy(s: Strategy)`
  - `getOrders(): Order[]`, `addOrder(o: Order): void`, `getStrategies(): Strategy[]`, `saveStrategy(s: Strategy): void`, `deleteStrategy(id: string): void`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/builder.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilder } from '@/lib/state/builder';
import { generateChain } from '@/lib/chains/generate';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';

describe('builder store', () => {
  beforeEach(() => {
    useBuilder.getState().setUnderlying('AURA');
    useBuilder.getState().setExpiration(EXPIRATIONS[0]);
  });

  it('starts on the first underlying and expiration with no legs', () => {
    const s = useBuilder.getState();
    expect(s.underlyingSymbol).toBe('AURA');
    expect(s.expiration).toBe(EXPIRATIONS[0]);
    expect(s.legs).toEqual([]);
  });

  it('applies a template using the current chain', () => {
    useBuilder.getState().applyTemplate('iron_condor');
    const s = useBuilder.getState();
    expect(s.legs).toHaveLength(4);
    expect(s.templateId).toBe('iron_condor');
    expect(s.legs.every((l) => l.expiration === s.expiration)).toBe(true);
  });

  it('changing underlying or expiration clears legs', () => {
    useBuilder.getState().applyTemplate('long_straddle');
    useBuilder.getState().setExpiration(EXPIRATIONS[2]);
    expect(useBuilder.getState().legs).toEqual([]);
    useBuilder.getState().applyTemplate('long_straddle');
    useBuilder.getState().setUnderlying('BOLT');
    expect(useBuilder.getState().legs).toEqual([]);
  });

  it('adds a leg from a quote and reprices edits from the chain', () => {
    const chain = generateChain(UNDERLYINGS[0], EXPIRATIONS[0]);
    const quote = chain.find((q) => q.type === 'call')!;
    useBuilder.getState().addLegFromQuote(quote, 'buy');
    expect(useBuilder.getState().legs[0].price).toBe(quote.mid);
    useBuilder.getState().updateLeg(0, { side: 'sell' });
    expect(useBuilder.getState().legs[0].side).toBe('sell');
    useBuilder.getState().removeLeg(0);
    expect(useBuilder.getState().legs).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/builder.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the store and persistence modules**

```ts
// lib/state/builder.ts
import { create } from 'zustand';
import { generateChain } from '@/lib/chains/generate';
import { EXPIRATIONS, UNDERLYINGS } from '@/lib/market/constants';
import { track } from '@/lib/analytics/store';
import { getTemplate, type TemplateId } from '@/lib/strategies/templates';
import type { Leg, OptionQuote, Side, Strategy } from '@/lib/types';

interface BuilderState {
  underlyingSymbol: string;
  expiration: string;
  legs: Leg[];
  templateId: TemplateId | null;
  setUnderlying(symbol: string): void;
  setExpiration(expiration: string): void;
  applyTemplate(id: TemplateId): void;
  addLegFromQuote(q: OptionQuote, side: Side): void;
  updateLeg(index: number, patch: Partial<Leg>): void;
  removeLeg(index: number): void;
  clearLegs(): void;
  loadStrategy(s: Strategy): void;
}

const underlyingOf = (symbol: string) =>
  UNDERLYINGS.find((u) => u.symbol === symbol) ?? UNDERLYINGS[0];

export const useBuilder = create<BuilderState>((set, get) => ({
  underlyingSymbol: UNDERLYINGS[0].symbol,
  expiration: EXPIRATIONS[0],
  legs: [],
  templateId: null,

  setUnderlying(symbol) {
    set({ underlyingSymbol: symbol, legs: [], templateId: null });
    track('chain_viewed', { underlying: symbol });
  },
  setExpiration(expiration) {
    set({ expiration, legs: [], templateId: null });
  },
  applyTemplate(id) {
    const { underlyingSymbol, expiration } = get();
    const u = underlyingOf(underlyingSymbol);
    const legs = getTemplate(id).build(generateChain(u, expiration), u);
    set({ legs, templateId: id });
    track('template_selected', { template: id, underlying: underlyingSymbol });
  },
  addLegFromQuote(q, side) {
    const legs = [
      ...get().legs,
      { kind: q.type, side, strike: q.strike, expiration: q.expiration, quantity: 1, price: q.mid },
    ];
    set({ legs, templateId: null });
    track('leg_edited', { action: 'add', legs: legs.length });
  },
  updateLeg(index, patch) {
    const legs = get().legs.map((l, i) => (i === index ? { ...l, ...patch } : l));
    set({ legs, templateId: null });
    track('leg_edited', { action: 'update', legs: legs.length });
  },
  removeLeg(index) {
    const legs = get().legs.filter((_, i) => i !== index);
    set({ legs, templateId: null });
    track('leg_edited', { action: 'remove', legs: legs.length });
  },
  clearLegs() {
    set({ legs: [], templateId: null });
  },
  loadStrategy(s) {
    const optionLeg = s.legs.find((l) => l.kind !== 'stock');
    set({
      underlyingSymbol: s.underlying,
      expiration: optionLeg?.expiration ?? EXPIRATIONS[0],
      legs: s.legs,
      templateId: null,
    });
  },
}));
```

```ts
// lib/persist/orders.ts
import type { Order } from '@/lib/types';

const KEY = 'spread-studio:orders';

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Order[];
  } catch {
    return [];
  }
}

export function addOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify([order, ...getOrders()]));
}
```

```ts
// lib/persist/strategies.ts
import type { Strategy } from '@/lib/types';

const KEY = 'spread-studio:strategies';

export function getStrategies(): Strategy[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Strategy[];
  } catch {
    return [];
  }
}

export function saveStrategy(s: Strategy): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify([s, ...getStrategies()]));
}

export function deleteStrategy(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(getStrategies().filter((s) => s.id !== id)));
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run`
Expected: PASS, all unit suites green (`track` is an SSR no-op under the node environment, which is what we want).

- [ ] **Step 5: Commit**

```powershell
git add lib tests
git commit -m "feat: builder store with template application and localStorage persistence"
```

---

## Phase C: UI

UI tasks verify with `npm run build` (type safety) plus a visual smoke check in the dev server. Behavior is locked in by the Task 21 e2e. Keep every `data-testid` exactly as written; the e2e depends on them.

Note for the implementer: the frontend-design skill (if available) is worth invoking once before Task 14 for the visual language; the dataviz skill before Task 17 and Task 19 chart work. Visual bar: dense dark trading terminal, not a marketing site. Zinc-950 background, zinc-900 panels, zinc-800 borders, emerald-400 for gains/credits, red-400 for losses/debits, amber-400 accent for interactive highlights, `tabular-nums` on all numbers.

### Task 14: App shell, nav, theme

**Files:**
- Create: `components/Nav.tsx`
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `app/orders/page.tsx` (placeholder), `app/analytics/page.tsx` (placeholder)

**Interfaces:**
- Produces: three routes with shared nav; testids `nav-builder`, `nav-orders`, `nav-analytics`.

- [ ] **Step 1: Write `components/Nav.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Builder', testid: 'nav-builder' },
  { href: '/orders', label: 'Orders', testid: 'nav-orders' },
  { href: '/analytics', label: 'Analytics', testid: 'nav-analytics' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="flex items-center gap-6 border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <span className="text-sm font-semibold tracking-widest text-amber-400">
        SPREAD STUDIO
      </span>
      <nav className="flex gap-4 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            data-testid={l.testid}
            className={
              pathname === l.href
                ? 'text-zinc-100 underline underline-offset-8 decoration-amber-400'
                : 'text-zinc-400 hover:text-zinc-100'
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <span className="ml-auto text-xs text-zinc-500">
        Simulated data. Market date 2026-07-06. Not investment advice.
      </span>
    </header>
  );
}
```

- [ ] **Step 2: Mount Nav in `app/layout.tsx`** (add `<Nav />` above `{children}`, import from `@/components/Nav`). Create placeholder pages:

```tsx
// app/orders/page.tsx
export default function OrdersPage() {
  return <main className="p-6">Orders</main>;
}
```

```tsx
// app/analytics/page.tsx
export default function AnalyticsPage() {
  return <main className="p-6">Analytics</main>;
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build passes. Dev-server smoke: all three routes render with nav.

- [ ] **Step 4: Commit**

```powershell
git add app components
git commit -m "feat: app shell with nav and dark trading theme"
```

### Task 15: Builder page: underlying picker, expiration tabs, chain table

**Files:**
- Create: `components/UnderlyingPicker.tsx`, `components/ExpirationTabs.tsx`, `components/ChainTable.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `useBuilder`, `generateChain`, `UNDERLYINGS`, `EXPIRATIONS`.
- Produces testids: `underlying-{SYMBOL}` (e.g. `underlying-AURA`), `expiration-{date}`, `chain-table`, and per-quote add buttons `add-{type}-{strike}-{side}` (e.g. `add-call-190-buy`).

- [ ] **Step 1: Write `components/UnderlyingPicker.tsx`**

```tsx
'use client';
import { UNDERLYINGS } from '@/lib/market/constants';
import { useBuilder } from '@/lib/state/builder';
import { fmtUsd } from '@/lib/util';

export function UnderlyingPicker() {
  const { underlyingSymbol, setUnderlying } = useBuilder();
  return (
    <div className="flex flex-wrap gap-2">
      {UNDERLYINGS.map((u) => (
        <button
          key={u.symbol}
          data-testid={`underlying-${u.symbol}`}
          onClick={() => setUnderlying(u.symbol)}
          className={`rounded border px-3 py-1.5 text-left text-xs ${
            u.symbol === underlyingSymbol
              ? 'border-amber-400 bg-zinc-900 text-zinc-100'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          <div className="font-semibold">{u.symbol}</div>
          <div className="num">{fmtUsd(u.spot)}</div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/ExpirationTabs.tsx`**

```tsx
'use client';
import { EXPIRATIONS } from '@/lib/market/constants';
import { useBuilder } from '@/lib/state/builder';

export function ExpirationTabs() {
  const { expiration, setExpiration } = useBuilder();
  return (
    <div className="flex gap-1">
      {EXPIRATIONS.map((e) => (
        <button
          key={e}
          data-testid={`expiration-${e}`}
          onClick={() => setExpiration(e)}
          className={`rounded-t px-3 py-1 text-xs ${
            e === expiration
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/ChainTable.tsx`**

One row per strike: call cell | strike | put cell. Each side shows bid/ask/delta and two small B (buy) and S (sell) buttons calling `addLegFromQuote`. ATM strike row gets an amber left border.

```tsx
'use client';
import { useMemo } from 'react';
import { generateChain } from '@/lib/chains/generate';
import { UNDERLYINGS } from '@/lib/market/constants';
import { useBuilder } from '@/lib/state/builder';
import type { OptionQuote, Side } from '@/lib/types';

function SideCell({ quote, addLeg }: { quote: OptionQuote; addLeg: (q: OptionQuote, s: Side) => void }) {
  return (
    <div className="flex items-center justify-end gap-2 px-2 py-1">
      <span className="num w-14 text-zinc-400">{quote.bid.toFixed(2)}</span>
      <span className="num w-14 text-zinc-100">{quote.ask.toFixed(2)}</span>
      <span className="num w-12 text-zinc-500">{quote.greeks.delta.toFixed(2)}</span>
      {(['buy', 'sell'] as const).map((side) => (
        <button
          key={side}
          data-testid={`add-${quote.type}-${quote.strike}-${side}`}
          onClick={() => addLeg(quote, side)}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            side === 'buy' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
          } hover:opacity-80`}
        >
          {side === 'buy' ? 'B' : 'S'}
        </button>
      ))}
    </div>
  );
}

export function ChainTable() {
  const { underlyingSymbol, expiration, addLegFromQuote } = useBuilder();
  const underlying = UNDERLYINGS.find((u) => u.symbol === underlyingSymbol)!;
  const chain = useMemo(
    () => generateChain(underlying, expiration),
    [underlying, expiration],
  );
  const strikes = [...new Set(chain.map((q) => q.strike))];

  return (
    <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800" data-testid="chain-table">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-zinc-900 text-zinc-500">
          <tr>
            <th className="px-2 py-1 text-right">Calls (bid / ask / delta)</th>
            <th className="px-2 py-1">Strike</th>
            <th className="px-2 py-1 text-right">Puts (bid / ask / delta)</th>
          </tr>
        </thead>
        <tbody>
          {strikes.map((strike) => {
            const call = chain.find((q) => q.strike === strike && q.type === 'call')!;
            const put = chain.find((q) => q.strike === strike && q.type === 'put')!;
            const isAtm =
              Math.abs(strike - underlying.spot) ===
              Math.min(...strikes.map((s) => Math.abs(s - underlying.spot)));
            return (
              <tr
                key={strike}
                className={`border-t border-zinc-900 ${isAtm ? 'border-l-2 border-l-amber-400 bg-zinc-900/40' : ''}`}
              >
                <td><SideCell quote={call} addLeg={addLegFromQuote} /></td>
                <td className="num px-2 font-semibold text-zinc-200">{strike}</td>
                <td><SideCell quote={put} addLeg={addLegFromQuote} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Compose `app/page.tsx`** (two-column layout; right column filled by Tasks 16-17)

```tsx
'use client';
import { ChainTable } from '@/components/ChainTable';
import { ExpirationTabs } from '@/components/ExpirationTabs';
import { UnderlyingPicker } from '@/components/UnderlyingPicker';

export default function BuilderPage() {
  return (
    <main className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <section className="space-y-3">
        <UnderlyingPicker />
        <ExpirationTabs />
        <ChainTable />
      </section>
      <section className="space-y-3" data-testid="strategy-panel">
        {/* TemplatePicker, LegEditor, AnalysisPanel land in Tasks 16-17 */}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verify and commit**

Run: `npm run build` (expect pass), dev-server smoke (chain renders, switching underlying/expiration updates it).

```powershell
git add app components
git commit -m "feat: builder page with underlying picker, expiration tabs, chain table"
```

### Task 16: Template picker and leg editor

**Files:**
- Create: `components/TemplatePicker.tsx`, `components/LegEditor.tsx`
- Modify: `app/page.tsx` (mount both in the strategy panel)

**Interfaces:**
- Consumes: `TEMPLATES`, `useBuilder`.
- Produces testids: `template-{id}` (e.g. `template-iron_condor`), `legs-list`, `leg-{index}`, `leg-{index}-remove`, `leg-{index}-qty`, `clear-legs`.

- [ ] **Step 1: Write `components/TemplatePicker.tsx`**

```tsx
'use client';
import { TEMPLATES } from '@/lib/strategies/templates';
import { useBuilder } from '@/lib/state/builder';

export function TemplatePicker() {
  const { templateId, applyTemplate } = useBuilder();
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Templates
      </h2>
      <div className="grid grid-cols-3 gap-1.5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            data-testid={`template-${t.id}`}
            title={t.description}
            onClick={() => applyTemplate(t.id)}
            className={`rounded border px-2 py-1.5 text-[11px] ${
              t.id === templateId
                ? 'border-amber-400 bg-zinc-900 text-zinc-100'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/LegEditor.tsx`**

```tsx
'use client';
import { useBuilder } from '@/lib/state/builder';

export function LegEditor() {
  const { legs, updateLeg, removeLeg, clearLegs } = useBuilder();
  if (legs.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
        Apply a template or add legs from the chain.
      </p>
    );
  }
  return (
    <div data-testid="legs-list" className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Legs</h2>
        <button data-testid="clear-legs" onClick={clearLegs} className="text-[11px] text-zinc-500 hover:text-red-400">
          Clear all
        </button>
      </div>
      {legs.map((leg, i) => (
        <div
          key={i}
          data-testid={`leg-${i}`}
          className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs"
        >
          <button
            onClick={() => updateLeg(i, { side: leg.side === 'buy' ? 'sell' : 'buy' })}
            className={`w-10 rounded px-1 py-0.5 text-[10px] font-bold ${
              leg.side === 'buy' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
            }`}
          >
            {leg.side.toUpperCase()}
          </button>
          <span className="w-12 font-semibold text-zinc-200">
            {leg.kind === 'stock' ? 'STOCK' : leg.kind.toUpperCase()}
          </span>
          <span className="num w-14 text-zinc-300">{leg.kind === 'stock' ? '' : leg.strike}</span>
          <input
            data-testid={`leg-${i}-qty`}
            type="number"
            min={1}
            value={leg.quantity}
            onChange={(e) => updateLeg(i, { quantity: Math.max(1, Number(e.target.value)) })}
            className="w-14 rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-right"
          />
          <span className="num ml-auto text-zinc-400">@ {leg.price.toFixed(2)}</span>
          <button
            data-testid={`leg-${i}-remove`}
            onClick={() => removeLeg(i)}
            className="text-zinc-600 hover:text-red-400"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Mount both in the strategy panel** in `app/page.tsx` (replace the placeholder comment with `<TemplatePicker />` then `<LegEditor />`).

- [ ] **Step 4: Verify and commit**

Run: `npm run build` (pass), dev smoke (apply iron condor, see 4 legs, toggle a side, remove a leg).

```powershell
git add app components
git commit -m "feat: template picker and leg editor"
```

### Task 17: Analysis panel: payoff chart, metrics, Greeks

**Files:**
- Create: `components/AnalysisPanel.tsx`, `components/PayoffChart.tsx`, `components/MetricsGrid.tsx`, `components/GreeksTable.tsx`
- Modify: `app/page.tsx` (mount AnalysisPanel below LegEditor)

**Interfaces:**
- Consumes: `analyzePayoff`, `useBuilder`, `track`.
- Produces testids: `metric-max-profit`, `metric-max-loss`, `metric-breakevens`, `metric-net-premium`, `payoff-chart`, `greeks-table`, `open-ticket`, `save-strategy`.
- Fires `strategy_analyzed` (debounced 800ms) whenever legs change and are non-empty.

- [ ] **Step 1: Write `components/MetricsGrid.tsx`**

```tsx
'use client';
import type { PayoffAnalysis } from '@/lib/payoff/payoff';
import { fmtUsd } from '@/lib/util';

function fmtPl(x: number): string {
  return Number.isFinite(x) ? fmtUsd(x) : 'Unlimited';
}

export function MetricsGrid({ analysis }: { analysis: PayoffAnalysis }) {
  const cells = [
    {
      id: 'metric-net-premium',
      label: analysis.netPremium >= 0 ? 'Net debit' : 'Net credit',
      value: fmtUsd(Math.abs(analysis.netPremium)),
      tone: 'text-zinc-100',
    },
    {
      id: 'metric-max-profit',
      label: 'Max profit',
      value: fmtPl(analysis.maxProfit),
      tone: 'text-emerald-400',
    },
    {
      id: 'metric-max-loss',
      label: 'Max loss',
      value: fmtPl(analysis.maxLoss),
      tone: 'text-red-400',
    },
    {
      id: 'metric-breakevens',
      label: 'Breakevens',
      value: analysis.breakevens.length ? analysis.breakevens.map((b) => b.toFixed(2)).join(' / ') : 'None',
      tone: 'text-zinc-100',
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map((c) => (
        <div key={c.id} className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">{c.label}</div>
          <div data-testid={c.id} className={`num text-sm font-semibold ${c.tone}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/PayoffChart.tsx`**

```tsx
'use client';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PayoffPoint } from '@/lib/payoff/payoff';

export function PayoffChart({ points, spot }: { points: PayoffPoint[]; spot: number }) {
  return (
    <div data-testid="payoff-chart" className="h-52 rounded border border-zinc-800 bg-zinc-900/60 p-2">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="price"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: '#71717a', fontSize: 10 }}
            tickFormatter={(v: number) => v.toFixed(0)}
            stroke="#3f3f46"
          />
          <YAxis tick={{ fill: '#71717a', fontSize: 10 }} stroke="#3f3f46" width={56} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }}
            formatter={(v) => [`$${Number(v).toFixed(0)}`, 'P/L at expiration']}
            labelFormatter={(l) => `Underlying at ${Number(l).toFixed(2)}`}
          />
          <ReferenceLine y={0} stroke="#52525b" />
          <ReferenceLine x={spot} stroke="#f59e0b" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="pl" stroke="#34d399" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/GreeksTable.tsx`**

Aggregate per Greek: options contribute `sign(side) * qty * 100 * greek`; stock contributes delta `sign(side) * qty * 100`, other Greeks 0.

```tsx
'use client';
import { generateChain } from '@/lib/chains/generate';
import { UNDERLYINGS } from '@/lib/market/constants';
import { useBuilder } from '@/lib/state/builder';
import type { Leg } from '@/lib/types';
import { useMemo } from 'react';

const GREEK_KEYS = ['delta', 'gamma', 'theta', 'vega'] as const;

export function GreeksTable() {
  const { legs, underlyingSymbol, expiration } = useBuilder();
  const underlying = UNDERLYINGS.find((u) => u.symbol === underlyingSymbol)!;
  const chain = useMemo(() => generateChain(underlying, expiration), [underlying, expiration]);

  const greeksOf = (leg: Leg) => {
    if (leg.kind === 'stock') return { delta: 1, gamma: 0, theta: 0, vega: 0 };
    return (
      chain.find((q) => q.type === leg.kind && q.strike === leg.strike)?.greeks ?? {
        delta: 0, gamma: 0, theta: 0, vega: 0,
      }
    );
  };
  const sign = (leg: Leg) => (leg.side === 'buy' ? 1 : -1);
  const totals = GREEK_KEYS.map((k) =>
    legs.reduce((sum, leg) => sum + sign(leg) * leg.quantity * 100 * greeksOf(leg)[k], 0),
  );

  if (legs.length === 0) return null;
  return (
    <table data-testid="greeks-table" className="w-full text-xs">
      <thead className="text-zinc-500">
        <tr>
          <th className="px-2 py-1 text-left">Leg</th>
          {GREEK_KEYS.map((k) => (
            <th key={k} className="px-2 py-1 text-right capitalize">{k}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {legs.map((leg, i) => (
          <tr key={i} className="border-t border-zinc-900 text-zinc-400">
            <td className="px-2 py-1">
              {leg.side.toUpperCase()} {leg.kind === 'stock' ? 'STOCK' : `${leg.strike} ${leg.kind.toUpperCase()}`}
            </td>
            {GREEK_KEYS.map((k) => (
              <td key={k} className="num px-2 py-1">
                {(sign(leg) * leg.quantity * 100 * greeksOf(leg)[k]).toFixed(1)}
              </td>
            ))}
          </tr>
        ))}
        <tr className="border-t border-zinc-700 font-semibold text-zinc-200">
          <td className="px-2 py-1">Position</td>
          {totals.map((t, i) => (
            <td key={GREEK_KEYS[i]} className="num px-2 py-1">{t.toFixed(1)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Write `components/AnalysisPanel.tsx`**

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { GreeksTable } from '@/components/GreeksTable';
import { MetricsGrid } from '@/components/MetricsGrid';
import { OrderTicketModal } from '@/components/OrderTicketModal';
import { PayoffChart } from '@/components/PayoffChart';
import { track } from '@/lib/analytics/store';
import { UNDERLYINGS } from '@/lib/market/constants';
import { analyzePayoff } from '@/lib/payoff/payoff';
import { saveStrategy } from '@/lib/persist/strategies';
import { useBuilder } from '@/lib/state/builder';

export function AnalysisPanel() {
  const { legs, underlyingSymbol, templateId } = useBuilder();
  const [ticketOpen, setTicketOpen] = useState(false);
  const spot = UNDERLYINGS.find((u) => u.symbol === underlyingSymbol)!.spot;
  const analysis = useMemo(() => (legs.length ? analyzePayoff(legs, spot) : null), [legs, spot]);

  useEffect(() => {
    if (legs.length === 0) return;
    const t = setTimeout(
      () =>
        track('strategy_analyzed', {
          underlying: underlyingSymbol,
          legs: legs.length,
          template: templateId ?? 'custom',
        }),
      800,
    );
    return () => clearTimeout(t);
  }, [legs, underlyingSymbol, templateId]);

  if (!analysis) return null;
  return (
    <div className="space-y-3">
      <MetricsGrid analysis={analysis} />
      <PayoffChart points={analysis.points} spot={spot} />
      <GreeksTable />
      <div className="flex gap-2">
        <button
          data-testid="open-ticket"
          onClick={() => {
            track('order_ticket_opened', { underlying: underlyingSymbol, legs: legs.length });
            setTicketOpen(true);
          }}
          className="flex-1 rounded bg-amber-400 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
        >
          Review order
        </button>
        <button
          data-testid="save-strategy"
          onClick={() => {
            saveStrategy({
              id: crypto.randomUUID(),
              name: templateId ?? 'Custom strategy',
              underlying: underlyingSymbol,
              legs,
              createdAt: new Date().toISOString(),
            });
            track('strategy_saved', { underlying: underlyingSymbol, legs: legs.length });
          }}
          className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500"
        >
          Save
        </button>
      </div>
      {ticketOpen && <OrderTicketModal analysis={analysis} onClose={() => setTicketOpen(false)} />}
    </div>
  );
}
```

Note: `OrderTicketModal` is created in Task 18. To keep this task independently buildable, create a stub now and replace it in Task 18:

```tsx
// components/OrderTicketModal.tsx (stub, replaced in Task 18)
'use client';
import type { PayoffAnalysis } from '@/lib/payoff/payoff';

export function OrderTicketModal({ onClose }: { analysis: PayoffAnalysis; onClose: () => void }) {
  return (
    <div className="rounded border border-zinc-800 p-3 text-xs text-zinc-500">
      Order ticket coming in Task 18. <button onClick={onClose}>Close</button>
    </div>
  );
}
```

- [ ] **Step 5: Mount `<AnalysisPanel />`** in `app/page.tsx` below `<LegEditor />`.

- [ ] **Step 6: Verify and commit**

Run: `npm run build` (pass) and dev smoke (apply iron condor: metrics populate, chart draws, spot line visible).

```powershell
git add app components
git commit -m "feat: live analysis panel with payoff chart, metrics, and Greeks"
```

### Task 18: Order ticket, orders page, saved strategies

**Files:**
- Modify: `components/OrderTicketModal.tsx` (replace stub)
- Modify: `app/orders/page.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `addOrder`, `getOrders`, `getStrategies`, `deleteStrategy`, `useBuilder.loadStrategy`, `track`, `netPremium`.
- Produces testids: `ticket-modal`, `confirm-order`, `cancel-order`, `orders-table`, `order-row` (one per order), `strategies-list`, `strategy-load-{index}`.

- [ ] **Step 1: Replace `components/OrderTicketModal.tsx`**

```tsx
'use client';
import { track } from '@/lib/analytics/store';
import type { PayoffAnalysis } from '@/lib/payoff/payoff';
import { addOrder } from '@/lib/persist/orders';
import { useBuilder } from '@/lib/state/builder';
import { fmtUsd } from '@/lib/util';
import { useState } from 'react';

export function OrderTicketModal({
  analysis,
  onClose,
}: {
  analysis: PayoffAnalysis;
  onClose: () => void;
}) {
  const { legs, underlyingSymbol, templateId, clearLegs } = useBuilder();
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    addOrder({
      id: crypto.randomUUID(),
      underlying: underlyingSymbol,
      strategyName: templateId ?? 'Custom strategy',
      legs,
      netPremium: analysis.netPremium,
      placedAt: new Date().toISOString(),
    });
    track('order_placed', {
      underlying: underlyingSymbol,
      legs: legs.length,
      net_premium: analysis.netPremium,
    });
    setConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div data-testid="ticket-modal" className="w-96 rounded border border-zinc-700 bg-zinc-900 p-4">
        {confirmed ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-emerald-400">Simulated order filled at mid</p>
            <p className="text-xs text-zinc-400">View it on the Orders page.</p>
            <button
              data-testid="close-ticket"
              onClick={() => {
                clearLegs();
                onClose();
              }}
              className="rounded bg-zinc-700 px-4 py-1.5 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-100">Simulated order: {underlyingSymbol}</h3>
            <ul className="space-y-1 text-xs text-zinc-300">
              {legs.map((l, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {l.side.toUpperCase()} {l.quantity} {l.kind === 'stock' ? 'STOCK (100 sh)' : `${l.strike} ${l.kind.toUpperCase()}`}
                  </span>
                  <span className="num">@ {l.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-400">
              Net {analysis.netPremium >= 0 ? 'debit' : 'credit'}:{' '}
              <span className="num text-zinc-100">{fmtUsd(Math.abs(analysis.netPremium))}</span>
            </p>
            <div className="flex gap-2">
              <button
                data-testid="confirm-order"
                onClick={confirm}
                className="flex-1 rounded bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                Place simulated order
              </button>
              <button data-testid="cancel-order" onClick={onClose} className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/orders/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics/store';
import { getOrders } from '@/lib/persist/orders';
import { deleteStrategy, getStrategies } from '@/lib/persist/strategies';
import { useBuilder } from '@/lib/state/builder';
import type { Order, Strategy } from '@/lib/types';
import { fmtUsd } from '@/lib/util';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const loadStrategy = useBuilder((s) => s.loadStrategy);
  const router = useRouter();

  useEffect(() => {
    track('page_view', { path: '/orders' });
    setOrders(getOrders());
    setStrategies(getStrategies());
  }, []);

  return (
    <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      <section>
        <h1 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Simulated orders
        </h1>
        {orders.length === 0 ? (
          <p className="text-xs text-zinc-600">No orders yet. Build a strategy and place one.</p>
        ) : (
          <table data-testid="orders-table" className="w-full text-xs">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-1">Placed</th>
                <th>Underlying</th>
                <th>Strategy</th>
                <th className="text-right">Legs</th>
                <th className="text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} data-testid="order-row" className="border-t border-zinc-900 text-zinc-300">
                  <td className="py-1.5">{new Date(o.placedAt).toLocaleString()}</td>
                  <td className="font-semibold">{o.underlying}</td>
                  <td>{o.strategyName}</td>
                  <td className="num">{o.legs.length}</td>
                  <td className={`num ${o.netPremium >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {o.netPremium >= 0 ? '-' : '+'}{fmtUsd(Math.abs(o.netPremium))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h1 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Saved strategies
        </h1>
        {strategies.length === 0 ? (
          <p className="text-xs text-zinc-600">Nothing saved yet.</p>
        ) : (
          <ul data-testid="strategies-list" className="space-y-1.5">
            {strategies.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 rounded border border-zinc-800 px-3 py-2 text-xs">
                <span className="font-semibold text-zinc-200">{s.underlying}</span>
                <span className="text-zinc-400">{s.name}</span>
                <span className="text-zinc-600">{s.legs.length} legs</span>
                <button
                  data-testid={`strategy-load-${i}`}
                  onClick={() => {
                    loadStrategy(s);
                    router.push('/');
                  }}
                  className="ml-auto rounded bg-zinc-800 px-2 py-1 text-zinc-200 hover:bg-zinc-700"
                >
                  Load
                </button>
                <button
                  onClick={() => {
                    deleteStrategy(s.id);
                    setStrategies(getStrategies());
                  }}
                  className="text-zinc-600 hover:text-red-400"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run build` (pass); dev smoke: place an order, confirm it appears on /orders, save a strategy, load it back.

```powershell
git add app components
git commit -m "feat: simulated order ticket, orders history, saved strategies"
```

### Task 19: Analytics dashboard

**Files:**
- Modify: `app/analytics/page.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `generateSeedEvents`, `getLiveEvents`, `computeFunnel`, `templatePopularity`, `countByName`, `getSessionId`.
- Produces testids: `tile-sessions`, `tile-orders`, `tile-conversion`, `funnel`, `funnel-stage-{key}` (e.g. `funnel-stage-order_placed`), `template-popularity`, `live-{eventName}` (e.g. `live-order_placed`, showing this session's live count for that event).

- [ ] **Step 1: Replace `app/analytics/page.tsx`**

Funnel bars are plain divs with proportional widths (no chart lib needed; more testable). Layout: three stat tiles on top, funnel left, template popularity plus "your live session" panel right.

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { computeFunnel, countByName, templatePopularity } from '@/lib/analytics/funnel';
import { generateSeedEvents } from '@/lib/analytics/seed';
import { getLiveEvents, getSessionId, track } from '@/lib/analytics/store';
import type { AnalyticsEvent, EventName } from '@/lib/types';

const LIVE_EVENTS: EventName[] = [
  'chain_viewed',
  'template_selected',
  'leg_edited',
  'strategy_analyzed',
  'order_ticket_opened',
  'order_placed',
  'strategy_saved',
];

export default function AnalyticsPage() {
  const [live, setLive] = useState<AnalyticsEvent[]>([]);
  useEffect(() => {
    track('page_view', { path: '/analytics' });
    setLive(getLiveEvents());
  }, []);

  const seed = useMemo(() => generateSeedEvents(), []);
  const all = useMemo(() => [...seed, ...live], [seed, live]);
  const funnel = useMemo(() => computeFunnel(all), [all]);
  const popularity = useMemo(() => templatePopularity(all), [all]);
  const sessionId = getSessionId();
  const mySessionCounts = useMemo(
    () => countByName(live.filter((e) => e.sessionId === sessionId)),
    [live, sessionId],
  );

  const sessions = funnel[0]?.sessions ?? 0;
  const placed = funnel[3]?.sessions ?? 0;
  const conversion = sessions ? Math.round((placed / sessions) * 100) : 0;
  const maxPop = popularity[0]?.count ?? 1;

  return (
    <main className="space-y-6 p-6">
      <p className="text-xs text-zinc-500">
        Seeded demo dataset ({seed.length} events) merged with your live events ({live.length}).
        Tracking plan: docs/product/success-metrics.md.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'tile-sessions', label: 'Sessions with a chain view', value: sessions },
          { id: 'tile-orders', label: 'Sessions with an order', value: placed },
          { id: 'tile-conversion', label: 'Chain to order conversion', value: `${conversion}%` },
        ].map((t) => (
          <div key={t.id} className="rounded border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">{t.label}</div>
            <div data-testid={t.id} className="num text-2xl font-semibold text-zinc-100">
              {t.value}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section data-testid="funnel">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Activation funnel (unique sessions)
          </h2>
          <div className="space-y-2">
            {funnel.map((stage) => (
              <div key={stage.key}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-zinc-400">{stage.label}</span>
                  <span data-testid={`funnel-stage-${stage.key}`} className="num text-zinc-200">
                    {stage.sessions}
                  </span>
                </div>
                <div className="h-4 rounded-sm bg-zinc-900">
                  <div
                    className="h-4 rounded-sm bg-amber-400/80"
                    style={{ width: `${sessions ? (stage.sessions / sessions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="space-y-6">
          <section data-testid="template-popularity">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Template popularity
            </h2>
            <div className="space-y-1.5">
              {popularity.slice(0, 6).map((p) => (
                <div key={p.template} className="flex items-center gap-2 text-xs">
                  <span className="w-36 text-zinc-400">{p.template}</span>
                  <div className="h-3 flex-1 rounded-sm bg-zinc-900">
                    <div
                      className="h-3 rounded-sm bg-emerald-400/70"
                      style={{ width: `${(p.count / maxPop) * 100}%` }}
                    />
                  </div>
                  <span className="num w-8 text-zinc-300">{p.count}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Your live session
            </h2>
            <table className="w-full text-xs">
              <tbody>
                {LIVE_EVENTS.map((name) => (
                  <tr key={name} className="border-t border-zinc-900">
                    <td className="py-1 text-zinc-400">{name}</td>
                    <td data-testid={`live-${name}`} className="num text-zinc-200">
                      {mySessionCounts[name] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run build` (pass); dev smoke: /analytics shows seeded funnel; after building a strategy and placing an order in the same browser session, live counts increment.

```powershell
git add app
git commit -m "feat: self-service analytics dashboard with funnel and live session events"
```

### Task 20: Instrumentation wiring audit

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: the event dictionary in `docs/product/success-metrics.md`.
- Produces: every event in the dictionary fires from exactly one place.

- [ ] **Step 1: Add the missing `page_view` and initial `chain_viewed` to the builder page**

In `app/page.tsx` add:

```tsx
import { useEffect } from 'react';
import { track } from '@/lib/analytics/store';
import { useBuilder } from '@/lib/state/builder';

// inside BuilderPage():
const underlyingSymbol = useBuilder((s) => s.underlyingSymbol);
useEffect(() => {
  track('page_view', { path: '/' });
  track('chain_viewed', { underlying: useBuilder.getState().underlyingSymbol });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] **Step 2: Audit against the dictionary**

Grep for each event name and confirm one firing site each:

```powershell
Select-String -Path app\*.tsx,app\**\*.tsx,components\*.tsx,lib\state\*.ts -Pattern "track\('"
```

Expected mapping: `page_view` (3 pages), `chain_viewed` (builder mount + setUnderlying), `template_selected` (store), `leg_edited` (store x3 actions), `strategy_analyzed` (AnalysisPanel), `order_ticket_opened` (AnalysisPanel), `order_placed` (OrderTicketModal), `strategy_saved` (AnalysisPanel). Fix discrepancies.

- [ ] **Step 3: Verify and commit**

Run: `npm run build` and `npx vitest run` (all pass).

```powershell
git add app
git commit -m "feat: complete event instrumentation per tracking plan"
```

---

## Phase D: Verification and shipping

### Task 21: Playwright end-to-end journey

**Files:**
- Test: `tests/e2e/journey.spec.ts`

**Interfaces:**
- Consumes: all testids defined in Tasks 14-19.

- [ ] **Step 1: Write the e2e test**

```ts
// tests/e2e/journey.spec.ts
import { expect, test } from '@playwright/test';

test('trader journey: chain -> iron condor -> order -> history -> analytics', async ({ page }) => {
  await page.goto('/');

  // Pick an underlying and see its chain
  await page.getByTestId('underlying-AURA').click();
  await expect(page.getByTestId('chain-table')).toBeVisible();

  // Apply the iron condor template
  await page.getByTestId('template-iron_condor').click();
  await expect(page.getByTestId('leg-3')).toBeVisible(); // 4 legs

  // Risk picture is visible with defined risk
  await expect(page.getByTestId('metric-max-loss')).not.toHaveText('Unlimited');
  await expect(page.getByTestId('metric-max-loss')).toContainText('$');
  await expect(page.getByTestId('metric-breakevens')).toContainText('/'); // two breakevens
  await expect(page.getByTestId('payoff-chart')).toBeVisible();

  // Wait past the strategy_analyzed debounce so the event lands
  await page.waitForTimeout(1000);

  // Place the simulated order
  await page.getByTestId('open-ticket').click();
  await page.getByTestId('confirm-order').click();
  await page.getByTestId('close-ticket').click();

  // Order shows in history
  await page.goto('/orders');
  await expect(page.getByTestId('order-row')).toHaveCount(1);
  await expect(page.getByTestId('order-row')).toContainText('AURA');

  // Analytics reflects this live session
  await page.goto('/analytics');
  await expect(page.getByTestId('live-order_placed')).toHaveText('1');
  await expect(page.getByTestId('live-strategy_analyzed')).not.toHaveText('0');
  // Seeded funnel is present and monotonic
  const viewed = Number(await page.getByTestId('funnel-stage-chain_viewed').textContent());
  const placed = Number(await page.getByTestId('funnel-stage-order_placed').textContent());
  expect(viewed).toBeGreaterThan(placed);
  expect(placed).toBeGreaterThan(0);
});

test('custom legs from the chain and save/load round trip', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('underlying-BOLT').click();
  // Add a custom leg from the chain (any visible buy button)
  await page.locator('[data-testid^="add-call-"][data-testid$="-buy"]').first().click();
  await expect(page.getByTestId('leg-0')).toBeVisible();
  await page.getByTestId('save-strategy').click();
  await page.goto('/orders');
  await page.getByTestId('strategy-load-0').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('leg-0')).toBeVisible();
});
```

- [ ] **Step 2: Run to verify**

Run: `npx playwright test`
Expected: 2 passed. If a testid mismatch fails the run, fix the component to match this spec (the testids in Tasks 14-19 are the contract), not the test.

- [ ] **Step 3: Run the full suite**

Run: `npx vitest run` then `npm run build`
Expected: all green.

- [ ] **Step 4: Commit**

```powershell
git add tests
git commit -m "test: end-to-end trader journey and save/load round trip"
```

### Task 22: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI
on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CI: '1'
```

- [ ] **Step 2: Commit**

```powershell
git add .github
git commit -m "ci: run unit tests, build, and e2e on every push"
```

(The badge is added to the README in Task 23; CI proves green after Task 24 pushes.)

### Task 23: README, process narrative, screenshots

**Files:**
- Create: `docs/process/ai-workflow.md`, `tests/e2e/screenshots.spec.ts`, `docs/images/` (3 PNGs)
- Modify: `README.md` (create; repo has none yet)

- [ ] **Step 1: Write the screenshot capture spec**

```ts
// tests/e2e/screenshots.spec.ts
import { test } from '@playwright/test';

test.skip(!process.env.SCREENSHOTS, 'screenshots only on demand');

test('capture readme screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/');
  await page.getByTestId('underlying-AURA').click();
  await page.getByTestId('template-iron_condor').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/images/builder.png' });
  await page.getByTestId('open-ticket').click();
  await page.screenshot({ path: 'docs/images/ticket.png' });
  await page.getByTestId('confirm-order').click();
  await page.getByTestId('close-ticket').click();
  await page.goto('/analytics');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/images/analytics.png' });
});
```

Run: `$env:SCREENSHOTS='1'; npx playwright test tests/e2e/screenshots.spec.ts; Remove-Item Env:SCREENSHOTS`
Expected: 3 PNGs in `docs/images/`.

- [ ] **Step 2: Write `docs/process/ai-workflow.md`**

```markdown
# How this repo was built

This repo demonstrates a spec-driven, AI-first development workflow. A product manager
wrote the specs; Claude Code (Anthropic's agentic coding tool) wrote the code from them.

## The pipeline

1. Discovery. Personas and jobs-to-be-done in docs/product/discovery-brief.md set the
   problem. The tracking plan in docs/product/success-metrics.md defined success before
   any code existed.
2. Constitution. /speckit.constitution captured non-negotiable principles
   (.specify/memory/constitution.md): determinism, test discipline, instrumentation,
   scope discipline.
3. Specification. /speckit.specify turned the discovery brief into a machine-readable
   product spec (specs/001-*/spec.md) with user stories and acceptance criteria.
4. Planning. /speckit.plan produced the technical plan (specs/001-*/plan.md): module
   boundaries, testing policy, stack.
5. Tasks. /speckit.tasks broke the plan into an executable task list (specs/001-*/tasks.md).
6. Execution. Claude Code implemented tasks with TDD. Domain math was tested against
   published Black-Scholes reference values before any UI existed. Commits reference the
   task IDs they implement.
7. Verification. A Playwright journey covers the full user flow. CI runs unit tests,
   build, and e2e on every push.

## Why the commit history matters

Read the log oldest-first: constitution and specs land before any application code.
That ordering is the point. The spec is the source of truth; the code is its output.

## What the human did vs. what the AI did

Human (PM): problem framing, personas, event taxonomy, scope decisions and deferrals
(docs/product/roadmap.md), spec curation, acceptance of each task.
AI (Claude Code): implementation, tests, refactoring, this repo's plumbing.
```

- [ ] **Step 3: Write `README.md`**

```markdown
# Spread Studio

[![CI](https://github.com/OWNER/spread-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/spread-studio/actions/workflows/ci.yml)

A multi-leg options strategy builder, spec'd by a product manager and built by an AI
agent using GitHub Spec Kit and Claude Code.

**Live demo:** https://spread-studio.vercel.app (replace with actual URL)

![Builder](docs/images/builder.png)

## What it does

- Explore deterministic synthetic option chains for 8 underlyings (Black-Scholes pricing,
  volatility skew, 4 expirations).
- Build strategies from 9 templates (verticals, iron condor, straddle, strangle, covered
  call, cash-secured put, singles) or leg-by-leg from the chain.
- See the risk picture live while you build: payoff at expiration, breakevens, max
  profit/loss, net debit/credit, per-position Greeks.
- Place simulated mid-price orders and review them in order history. Save and reload
  strategies.
- Measure it all: a self-service analytics dashboard (/analytics) shows the activation
  funnel and template popularity from a tracked event taxonomy.

![Analytics](docs/images/analytics.png)

## Why this repo exists

It is a working demonstration of spec-driven product development with AI agents:

| Artifact | Role |
| --- | --- |
| [.specify/memory/constitution.md](.specify/memory/constitution.md) | Project principles the AI must obey |
| [docs/product/discovery-brief.md](docs/product/discovery-brief.md) | Personas and jobs-to-be-done |
| [docs/product/success-metrics.md](docs/product/success-metrics.md) | Tracking plan written before the code |
| [specs/001](specs) | spec.md, plan.md, tasks.md from /speckit.specify, /speckit.plan, /speckit.tasks |
| [docs/process/ai-workflow.md](docs/process/ai-workflow.md) | How the human/AI split worked |
| [docs/product/roadmap.md](docs/product/roadmap.md) | What was deferred and why |

The commit history reads oldest-first as: constitution, specs, then code, task by task.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # Vitest unit tests (pricing math vs reference values)
npm run test:e2e   # Playwright journey (needs: npx playwright install chromium)
```

No API keys, no database, no network calls. Market data is generated from a fixed
market date (2026-07-06), so the app works offline and every run is identical.

## Disclaimers

All market data is simulated. Orders are simulated. Nothing here is investment advice
or a brokerage service.
```

- [ ] **Step 4: Verify and commit**

Confirm no em-dashes crept into the three docs. Replace `OWNER` after Task 24 creates the GitHub repo (or set it now if the GitHub username is already known).

```powershell
git add README.md docs tests
git commit -m "docs: README, AI workflow narrative, and screenshots"
```

### Task 24: Merge, publish, deploy, verify live

**Files:**
- Modify: git branches, remote; `README.md` (badge owner + live URL)

- [ ] **Step 1: Full local verification before shipping**

```powershell
npx vitest run
npm run build
npx playwright test
git status
```

Expected: everything green, working tree clean. Also tick all completed checkboxes in `specs/001-*/tasks.md` and commit if any were missed.

- [ ] **Step 2: Merge the feature branch to main**

```powershell
git checkout main
git merge --no-ff 001-options-strategy-builder -m "feat: options strategy builder v1 (specs 001)"
```

Use the actual branch name noted in Task 4.

- [ ] **Step 3: CHECKPOINT (human needed): create the GitHub repo and push**

Requires an authenticated `gh` CLI. If `gh auth status` fails, STOP and ask the user to run `gh auth login` (suggest they type `! gh auth login` in the Claude Code prompt).

```powershell
gh auth status
gh repo create spread-studio --public --source . --push
```

Then update the README badge OWNER to the actual GitHub username, commit (`docs: point CI badge at published repo`), and `git push`. Confirm the Actions run goes green on github.com.

- [ ] **Step 4: CHECKPOINT (human needed): deploy to Vercel**

Requires Vercel auth. If not logged in, STOP and ask the user to run `npx vercel login` themselves, then continue:

```powershell
npx vercel link --yes
npx vercel --prod
```

Note the production URL. Update the README live-demo line with it, commit (`docs: add live demo URL`), push.

- [ ] **Step 5: Verify the live deployment end to end**

Run the e2e against production:

```powershell
$env:PLAYWRIGHT_BASE_URL='https://<prod-url>'
npx playwright test tests/e2e/journey.spec.ts
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

For this to work, first make `playwright.config.ts` respect the env var: change `baseURL` to `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'` and skip `webServer` when the env var is set:

```ts
const remote = !!process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000' },
  ...(remote
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
```

Commit this config change before running (`test: allow e2e against a remote base URL`). Expected: journey passes against production.

- [ ] **Step 6: Final commit and push**

```powershell
git push
```

Confirm on GitHub: green CI badge, README renders with screenshots, specs and docs folders browse cleanly.

### Task 25: Interview talking points (local only, never committed)

**Files:**
- Create: `D:\spread-studio-notes\interview-talking-points.md` (OUTSIDE the repo)

- [ ] **Step 1: Write the doc**

```markdown
# Spread Studio: interview talking points

## The 2-minute walkthrough

1. Open the README. "This repo runs the operating model from your job description:
   I wrote the specs, Claude Code built the product."
2. Open specs/001/spec.md, then plan.md, then tasks.md. "Real /speckit.specify,
   /speckit.plan, /speckit.tasks output, curated by me."
3. git log --reverse --oneline. "Constitution and specs land before any code. Commits
   reference task IDs."
4. Live demo: pick AURA, apply Iron Condor, point at max loss and breakevens updating
   live. Place the simulated order. Show it in Orders.
5. /analytics: "I wrote the tracking plan before the code. This funnel is that plan,
   rendered. The 'your live session' panel shows the events we just fired."

## Decisions to own proudly

- Synthetic data over a live API: determinism beats authenticity for an MVP demo; the
  adapter seam and the v2 roadmap item show I know the difference.
- Options-only v1, no positions P&L, no margin: scope discipline, documented with
  reasons in roadmap.md, not silently dropped.
- Single expiration per strategy: calendars need model-based (not intrinsic) valuation
  at the near expiration. Saying this out loud demonstrates derivatives depth.
- localStorage analytics instead of Amplitude: the PM deliverable is the taxonomy and
  funnel definition; vendor wiring is v2 plumbing.

## Likely questions and answers

- "How do you keep an AI agent honest?" TDD against published Black-Scholes reference
  values; a Playwright journey that exercises the product like a trader would; CI on
  every push; specs as the acceptance contract.
- "What broke?" Be honest about anything that did and how the spec or tests caught it.
- "How would you measure success post-launch?" Walk the funnel in
  success-metrics.md: activation to analyzed strategy, then analyzed-to-order
  conversion; guardrails on event hygiene.
- "Why should a PM code?" I did not write the code. I wrote specs precise enough that
  an agent could. That is the job posting's thesis, demonstrated.
- "What would v2 be?" Live data adapter, real Amplitude, positions P&L. Each already
  has a reasoned roadmap entry.

## Domain vocabulary to use naturally

Defined-risk spread, net credit vs. debit, breakeven, assignment risk, vol skew and
smile, theta decay per day, vega per vol point, mid-price fill, ATM/OTM strike ladder.
```

- [ ] **Step 2: Confirm it is outside the repo**

```powershell
git -C D:\spread-studio status --short
```

Expected: clean; the notes file lives in `D:\spread-studio-notes\`, untracked by any repo.

---

## Self-review results (already applied)

- Spec coverage: all design-spec sections map to tasks (chains 9, templates 11, payoff 10, analytics 12+19, order flow 18, e2e 21, CI 22, README 23, deploy 24, talking points 25, Spec Kit artifacts 2/4/5/6, PM docs 3).
- Type consistency: `Order.netPremium` (not `netPrice`) used in Task 8 types, Task 18 ticket, and orders page. Testids in Tasks 14-19 match Task 21's e2e verbatim.
- Known intentional simplifications: funnel stages do not enforce event ordering within a session (documented in success-metrics.md); `round2(Infinity)` passes through as Infinity by design.
