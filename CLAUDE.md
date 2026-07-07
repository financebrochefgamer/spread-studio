# Spread Studio

Deterministic, client-only multi-leg options strategy builder. Portfolio repo
demonstrating spec-driven development with AI agents. Live: https://spread-studio.vercel.app

## Non-negotiable constraints (from .specify/memory/constitution.md)

- Spec first. No feature code without a spec section demanding it. New features get a
  new `specs/NNN-name/` cycle (spec, plan, tasks) before implementation.
- Deterministic demo: no external APIs, no database, no auth, no Date.now() or
  Math.random() in domain logic. Fixed market date lives in lib/market/constants.ts.
- localStorage/sessionStorage only, always SSR-guarded and try/catch wrapped.
- Event names and properties must match docs/product/success-metrics.md exactly. No
  untracked user-facing features.
- All option legs in a strategy share one expiration (no calendars in v1; see roadmap).
- Money conventions: option price fields are per-share premiums; P/L and position
  Greeks are share-equivalent (x100 contract multiplier); netPremium > 0 is a debit.
- Prose in committed docs: no em-dashes, short sentences.
- Domain math (lib/pricing, lib/payoff, lib/chains, lib/analytics) is TDD with Vitest;
  product behavior is verified by the Playwright journey. CI must stay green.

## Commands

- `npm run dev` / `npm run build` / `npm run test` (Vitest) / `npm run test:e2e` (Playwright)
- Prod verification: `PLAYWRIGHT_BASE_URL=https://spread-studio.vercel.app npx playwright test tests/e2e/journey.spec.ts`
- Screenshots for README: set `SCREENSHOTS=1` and run tests/e2e/screenshots.spec.ts
- Deploy: `npx vercel --prod` (project is linked)
- If `npm run build` fails with a phantom type error about .next/types, delete .next and rebuild.

## Layout

- `lib/` pure domain modules (pricing, chains, payoff, strategies, analytics, persist, state)
- `app/` routes: / (builder), /orders, /analytics
- `components/` UI; data-testid attributes are the e2e contract, do not rename them
- `specs/` Spec Kit artifacts; `docs/product/` PM docs; `docs/process/` how this was built
- `.claude/skills/speckit-*` installed Spec Kit skills; scaffolding scripts in `.specify/scripts/powershell/`

## Process

Read docs/process/ai-workflow.md and docs/process/agent-handoff-review.md before large
changes. Deferred scope belongs in docs/product/roadmap.md with a reason, not in code.
