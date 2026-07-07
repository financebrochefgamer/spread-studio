# Tasks: Amplitude Adapter Behind an Env Flag

**Input**: spec.md (approved in PR #6, three review rounds) and plan.md in this directory.
**Tests**: Required per constitution. TDD for lib/analytics/amplitude.ts and the
store.ts integration; both are unit tests, no e2e changes (per spec's stated scope).

## Phase 1: Dependencies and the pure adapter module (TDD)

- [x] T301 Add `@amplitude/analytics-browser` (dependency) and `jsdom` (devDependency) to `package.json`; `npm install`
- [x] T302 [TDD] Write failing tests 1-5 from plan.md in `tests/unit/amplitude.test.ts`, then implement `lib/analytics/amplitude.ts` (sendToAmplitude, resetAmplitudeStateForTests) until green

## Phase 2: store.ts integration (TDD)

- [ ] T303 [TDD] Write failing tests 6-7 from plan.md in `tests/unit/store-amplitude.test.ts` (with `// @vitest-environment jsdom` at the top), then add the one-line `track()` integration in `lib/analytics/store.ts` until green

## Phase 3: Verification and docs

- [ ] T304 Full local suite green: `npm run test` (confirm the jsdom file is actually collected and runs), `npm run build`, `npx playwright test`
- [ ] T305 Build-output bundle check: run `npm run build` with `NEXT_PUBLIC_AMPLITUDE_API_KEY` unset, grep the client bundle output for "amplitude" (case-insensitive), confirm no match; record the command and output in the implementation report as the bundle-size evidence
- [ ] T306 Add a short "Amplitude (optional)" section to `README.md`: the exact env var name, that it is unset by default (including on the public demo), and one sentence on what happens when it is set
- [ ] T307 Open implementation PR; independent review; address findings
- [ ] T308 Merge; no deploy step required beyond the normal Vercel deploy (the env var stays unset there, so this merge does not change the live demo's behavior); update roadmap status
