# Spread Studio

AI-native derivatives strategy platform on a deterministic core, built by AI
agents directed by one PM. North star: docs/product/vision.md.
Live: https://spread-studio.vercel.app

## Non-negotiable constraints (from .specify/memory/constitution.md)

- Spec first. No feature code without a spec section demanding it. New features get a
  new `specs/NNN-name/` cycle (spec, plan, tasks) before implementation.
- Deterministic core: no external APIs, database, or auth by default; no
  Date.now() or Math.random() in domain logic. Fixed market date lives in
  lib/market/constants.ts. Optional integrations only as off-by-default
  adapters with a stated seam (constitution Principle II).
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

Read docs/product/vision.md before proposing, spec'ing, or planning any
feature; every feature spec must name the vision pillar and arc it advances
(constitution Principle VIII).

Read docs/process/playbook.md before starting any new feature; it is the living
operating procedure (spec PR review session, model tiering, working-tree discipline)
and its Lessons section is append-only. Also read docs/process/ai-workflow.md and
docs/process/agent-handoff-review.md for the origin story. Deferred scope belongs in
docs/product/roadmap.md with a reason, not in code. docs/product/role-gap-analysis.md
is the working spec queue for what to build next.

When a review, incident, or handoff teaches a process lesson, append it to
docs/process/playbook.md's Lessons section before moving on. This repo is meant to get
smarter across sessions, not relearn the same lessons.
