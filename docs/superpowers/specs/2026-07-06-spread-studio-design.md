# Spread Studio — Design Spec

Date: 2026-07-06
Status: Approved design, pending implementation plan

## Purpose

A portfolio repository targeting the TradeStation "Active Trader Product Manager" posting (LinkedIn job 4283099248). The role screens for: spec-driven development with GitHub Spec Kit (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`), daily Claude / Claude Code fluency, active-trader domain depth (multi-leg options, derivatives tooling), self-service analytics dashboards, and PM fundamentals.

The repo demonstrates all five by running the role's exact operating model end to end: the candidate writes PM artifacts and machine-readable specs; a Claude agent (Sonnet) builds the product from them. The working MVP is proof the specs were executable. The specs, plan, tasks, and commit history are the star; the app is the evidence.

Positioning note: the repo demonstrates the workflow without naming TradeStation. README pitch: "A multi-leg options strategy builder, spec'd by a PM and built by an AI agent using GitHub Spec Kit and Claude Code."

## Decisions made (with rationale)

1. **Positioning: spec-driven PM showcase**, not an engineering portfolio. The role is PM; the differentiator is driving an AI agent through rigorous specs.
2. **Product: multi-leg options strategy builder** — directly hits "options strategies, futures, and derivatives tooling" and the multi-leg options domain-knowledge requirement. Includes a usage-analytics dashboard to hit the "self-service analytics" requirement.
3. **Real GitHub Spec Kit tooling** (`specify init`, actual `/speckit.*` commands), not an emulation — the posting names these commands verbatim.
4. **Synthetic market data** — deterministic generated option chains; no API keys, no rate limits, demo works offline and never breaks. Live data is de-scoped to roadmap v2 (deliberately, as a scope-discipline story).
5. **Stack: Next.js (App Router) + TypeScript + Tailwind**, single app, no database, no auth, no external APIs. Chosen for fastest delivery, one process, free Vercel deploy, and broker-grade UI capability.
6. **Delivery: public GitHub repo + live Vercel URL**, linked from the job application/resume.
7. **Repo location:** `D:\spread-studio`, working name "Spread Studio" (rename is cheap).

## Repo layout

```
spread-studio/
├── README.md                     # story, live demo link, screenshots, CI badge
├── .specify/                     # real Spec Kit scaffolding
│   └── memory/constitution.md    # project principles (quality bars, testing, UX)
├── specs/001-strategy-builder/
│   ├── spec.md                   # from /speckit.specify — product spec
│   ├── plan.md                   # from /speckit.plan — technical plan
│   └── tasks.md                  # from /speckit.tasks — executable task list
├── docs/
│   ├── product/discovery-brief.md    # 3 active-trader personas, JTBD, pain points
│   ├── product/success-metrics.md    # Amplitude-style tracking plan + funnel definition
│   ├── product/roadmap.md            # v1 MVP → v2 live data + Amplitude → v3 futures
│   ├── process/ai-workflow.md        # narrative: how spec→plan→tasks→agent-build worked
│   └── superpowers/specs/            # this design doc
├── app/                          # Next.js App Router pages
├── lib/                          # pure TS domain modules (see Architecture)
└── tests/                        # Vitest unit + Playwright e2e
```

**Commit history is part of the artifact:** constitution and specs land in commits before any application code; implementation commits reference task IDs from `tasks.md`.

## MVP feature set (v1)

### Synthetic market data
- 6–8 fictional-but-plausible underlyings (equity-index-like and single-stock-like profiles with different price levels and vol regimes).
- Generated option chains: 3–4 expirations each, realistic strike ladders around spot, Black-Scholes pricing with a volatility skew/smile, modeled bid/ask spreads.
- Deterministic seed: identical output every run.

### Strategy builder
- 9 templates: long call, long put, covered call, cash-secured put, bull call vertical, bear put vertical, iron condor, long straddle, long strangle.
- Custom leg editor: add/remove legs, buy/sell side, quantity, strike, expiration.

### Analysis panel
- Payoff-at-expiration chart (P/L vs underlying price), breakeven point(s), max profit, max loss, net debit/credit.
- Aggregate and per-leg Greeks: delta, gamma, theta, vega.

### Simulated order flow
- Order ticket: review legs, mid-price fill, confirm.
- Orders history list; saved strategies list.
- Explicitly out of scope for v1: positions P&L tracking, margin modeling (roadmap v2, with rationale documented).

### Analytics dashboard (`/analytics`)
- Event taxonomy defined in `docs/product/success-metrics.md` in the format of an Amplitude tracking plan: `chain_viewed`, `template_selected`, `leg_edited`, `strategy_analyzed`, `order_ticket_opened`, `order_placed`, plus page views.
- Events fire client-side and persist to localStorage.
- Dashboard shows an activation funnel (viewed chain → built strategy → analyzed → placed order) and template popularity.
- Merges a seeded demo dataset with the visitor's live session events, clearly labeled as such.
- No database anywhere in the app. Real Amplitude integration is roadmap v2.

## Architecture

- Next.js App Router, TypeScript, Tailwind CSS. Dark, dense, broker-grade visual design.
- All domain math in pure, dependency-free TypeScript modules, unit-testable in isolation and runnable client-side (deployed app has effectively zero server failure modes):
  - `lib/pricing` — Black-Scholes price + Greeks
  - `lib/chains` — deterministic chain generation with vol skew
  - `lib/payoff` — multi-leg payoff, breakevens, max P/L
  - `lib/analytics` — event capture, storage, funnel aggregation
- Charts: Recharts.
- Client state: lightweight (Zustand or React context — implementer's choice).
- No auth, no external APIs, no database, no server-side persistence.

## Testing and CI

- **Vitest unit tests:** Black-Scholes prices and Greeks verified against published reference values; payoff/breakeven/max-P&L math for every template.
- **Playwright e2e:** the primary user journey — pick underlying → build iron condor → verify max loss displayed → place order → see it in orders history → verify funnel updates on `/analytics`. E2e coverage is preferred over unit tests for product behavior.
- GitHub Actions runs both on every push; green badge in README.

## Deliverables

1. Public GitHub repo as specified above.
2. Live Vercel deployment URL.
3. README with screenshots/GIF, live link, CI badge, and the positioning story.
4. Interview talking-points doc — kept local, NOT committed to the repo (demo walkthrough script, likely interview questions, how to discuss spec-driven process and de-scoping decisions).

## Build process

Executed by Claude Sonnet from a written implementation plan:

1. Spec Kit init (`specify init`) + write constitution.
2. Write PM docs (discovery brief, success metrics, roadmap). Commit.
3. Run `/speckit.specify` → curate `spec.md`. Commit.
4. Run `/speckit.plan` → curate `plan.md`. Commit.
5. Run `/speckit.tasks` → curate `tasks.md`. Commit.
6. Implement task-by-task with TDD; commits reference task IDs.
7. E2e verification, CI green, README polish with screenshots.
8. Deploy to Vercel; verify live URL end to end.
9. Write local interview talking-points doc.

Requirements at execution time: a GitHub account/repo to push to, and a Vercel account (both free tiers).

## Success criteria

- A reviewer landing on the README understands within 30 seconds that the repo demonstrates the spec-driven, AI-first PM workflow.
- Every `/speckit.*` artifact named in the job posting exists in the repo and is genuinely produced by Spec Kit.
- The live demo completes the full user journey without any external dependency.
- CI is green; unit tests validate the derivatives math against reference values.
- The commit history shows specs preceding code.
