# Feature Specification: Amplitude Adapter Behind an Env Flag

**Feature Branch**: `005-amplitude-adapter`

**Created**: 2026-07-07

**Status**: In review

**Input**: docs/product/roadmap.md v2 "Real Amplitude destination for the existing
event taxonomy," docs/product/role-gap-analysis.md Gap 3. Directly maps to the target
posting's "Amplitude, Databricks, or similar analytics platforms."

## Problem

This repo's event taxonomy (docs/product/success-metrics.md) and funnel math
(lib/analytics/funnel.ts) are real, but every event only ever lands in localStorage.
The repo can show a tracking plan was written before code; it cannot show that plan
actually reaches a real analytics vendor. The gap is not the taxonomy, it is the last
mile: wiring the same events to a destination a PM would actually use.

The public live demo must stay exactly as reliable as it is today: deterministic,
offline-capable, no real account required to run it. This spec's job is to prove the
wiring is real and tested, not to turn Amplitude on for the public demo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default behavior is unchanged (Priority: P1)

With no Amplitude API key configured (the default, including the deployed public
demo), the app behaves exactly as it does today: events go to localStorage only, no
network call is made, no new library code is loaded into the page.

**Why this priority**: This is the non-negotiable constraint. The deterministic-demo
constitution does not get relaxed to add a vendor integration; if this story breaks,
the feature is not shippable regardless of how well Amplitude tracking itself works.

**Acceptance**:
- With `NEXT_PUBLIC_AMPLITUDE_API_KEY` unset, calling `track()` writes to localStorage
  exactly as it does today (same return value, same shape, same session/event id
  behavior) and does not import or execute any Amplitude SDK code.
- The Amplitude SDK package is dynamically imported only inside the code path that
  runs when the key is present, so it adds zero bytes to the page's initial bundle
  when unset (verified by the SDK module never being requested in that path).
- All existing tests (36 unit, 3 e2e) continue to pass unmodified in behavior; the
  public Vercel deployment, which does not set this env var, is unaffected.

### User Story 2 - Opt-in real tracking, best-effort (Priority: P2)

With `NEXT_PUBLIC_AMPLITUDE_API_KEY` set, every event that fires through the existing
`track()` function also sends to Amplitude, using the same event name and properties
already defined in the tracking plan. No second event taxonomy, no renamed properties.

**Acceptance**:
- Amplitude is initialized once, lazily, on the first `track()` call after the key is
  present (not at module load, so this stays SSR-safe and adds no cost when unused).
  Initialization disables Amplitude's `autocapture` option (its own SDK feature for
  auto-tracking page views, sessions, clicks, form interactions, and similar; not a
  concept this repo invents): this repo already manually instruments every event it
  cares about, and autocapture would introduce untracked-plan events that break
  "event names and properties must match the tracking plan exactly" (constitution).
- Sending to Amplitude never throws, never blocks, and never rejects unhandled: it is
  fire-and-forget from `track()`'s perspective. If Amplitude's SDK throws or its
  promise rejects, `track()` still returns its normal value and localStorage still
  gets the event, unaffected.
- The Amplitude call uses the exact event name (an `EventName` from
  lib/analytics/events.ts) and the exact properties object already passed to
  `track()`. No transformation, no renaming.

### Edge cases

- Key present but invalid or Amplitude's servers unreachable: no visible effect on the
  app; this is exactly what "best-effort, never throws" exists to guarantee. Not
  something this spec's tests simulate against a real network (see Non-functional);
  it is guaranteed structurally by never awaiting or letting the call affect
  `track()`'s control flow.
- Key present in a server-side render context (no `window`): `track()` already returns
  `null` and no-ops when `!hasWindow()` (lib/analytics/store.ts:54); this spec does
  not change that guard, so Amplitude is never touched server-side either.
- Because this app's routes prerender as static content, `NEXT_PUBLIC_*` env vars are
  inlined at Vercel build time, not read at runtime. Setting the key later requires a
  rebuild and redeploy; this is a build-time flag, not a runtime toggle, and is stated
  here rather than discovered later as a surprise.

## Requirements *(mandatory)*

### Functional

- FR-001: New module `lib/analytics/amplitude.ts`, the only file that imports
  `@amplitude/analytics-browser`. No other file in the repo references the Amplitude
  package directly.
- FR-002: `lib/analytics/store.ts`'s existing `track()` function calls into this
  module after its existing localStorage write, unconditionally (the module itself
  decides whether the key is present and whether to do anything). `track()`'s
  signature, return value, and localStorage behavior are unchanged by this spec.
- FR-003: The module reads `process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY` at call time
  (not cached at import time in a way that defeats testing); if absent or empty,
  every exported function is a no-op that does not import the SDK.
- FR-004: No new events, no new properties, no changes to
  docs/product/success-metrics.md. This spec wires the existing taxonomy to a second
  destination; it does not extend the taxonomy.
- FR-005: The public Vercel deployment does not set `NEXT_PUBLIC_AMPLITUDE_API_KEY`.
  This spec does not include enabling Amplitude for the live demo; a real Amplitude
  project is out of scope (see Out of scope).

### Non-functional

- Determinism: with the key unset (the default, and the only state the public demo
  and CI ever run in), this feature introduces zero behavioral difference, zero new
  network calls, zero new imported code. The constitution's determinism principle is
  satisfied by construction, not by a runtime check that could fail.
- Unit tests mock `@amplitude/analytics-browser` entirely (no real network access from
  any test, ever, key present or not). Tests cover: key absent means the SDK module is
  never imported and `init`/`track` are never called; key present means `init` is
  called exactly once across multiple `track()` calls (idempotent) with autocapture
  disabled, and `track` is called with the exact event name and properties passed to
  the app's `track()` function; a mocked Amplitude `track` that throws does not
  propagate out of the app's `track()` function and does not prevent the localStorage
  write.
- No new automated e2e journey; the existing Playwright suite already exercises
  `track()` extensively with the key unset (the only state it runs in), which is
  exactly User Story 1's acceptance criterion in practice.

## Success criteria *(mandatory)*

- SC-1: Running the full existing test suite (unit and e2e) with no env var set
  produces identical results to before this spec, proving the default path is
  unchanged.
- SC-2: A unit test with the env var set and the Amplitude module mocked
  demonstrates, without any real network call, that every one of this repo's ten
  tracked event names would reach Amplitude with its exact properties if the key were
  real.
- SC-3: A reader of the README can find the exact env var name and understand that it
  is unset by default and why.

## Out of scope (with reasons)

- Actually enabling Amplitude for the public demo. No real Amplitude project exists
  for this repo, and turning it on would mean tracking real visitor data, a privacy
  and scope decision this portfolio project does not need to make. The wiring is
  proven by mocked tests, not a live account.
- A generic destination-adapter interface for multiple vendors (Amplitude, Databricks,
  etc.). YAGNI per constitution principle VI: this spec wires exactly the one vendor
  named in the target role's posting; a second destination would earn its own
  interface when a second destination actually exists, not before.
- Server-side or build-time event forwarding (e.g. a Databricks SQL model). Named in
  docs/product/role-gap-analysis.md Gap 3 as a separate, larger artifact; this spec is
  the client-side vendor wiring only.
- User identification, user properties, or Amplitude cohorts/dashboards configuration.
  This spec sends events; configuring what Amplitude does with them is Amplitude
  account administration, not application code.
