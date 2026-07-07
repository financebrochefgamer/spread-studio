# Tasks: Positions and Scenario Analysis

**Input**: spec.md (approved in PR #1) and plan.md in this directory.
**Tests**: Required per constitution. TDD for lib/positions; Playwright for the journey.

## Phase 1: Domain (TDD)

- [x] T101 Add `scenario_adjusted` and `position_closed` to the EventName union and add ClosedPosition type in `lib/types.ts`
- [x] T102 Create `lib/positions/scenario.ts` (Scenario, BASE_SCENARIO)
- [x] T103 [TDD] Write failing tests 1-6 and 8 from plan.md in `tests/unit/positions.test.ts`, then implement `lib/positions/valuation.ts` (lookupEntryIv, markLeg, valuePosition, valuePortfolio, maxDaysForward) until green
- [x] T104 [TDD] Write failing test 7 (idempotent close, open-list derivation), then implement `lib/persist/closedPositions.ts` with guarded storage
- [x] T105 Add funnel stage 5 in `lib/analytics/funnel.ts`; update its unit test to expect 5 stages with position_closed last

## Phase 2: UI

- [x] T106 `components/ScenarioControls.tsx` (three range inputs + reset; testids scenario-spot/vol/days/reset; 500ms debounced scenario_adjusted; reset fires one zeroed event)
- [x] T107 `components/PositionsTable.tsx` (open positions with per-position value/P&L/close; testids per plan)
- [x] T108 `app/positions/page.tsx` (portfolio summary with portfolio-pl and net Greeks, closed section, positions-empty state hiding sliders, page_view '/positions', position_closed event on close)
- [x] T109 Add Positions to `components/Nav.tsx` between Builder and Orders (nav-positions)
- [x] T110 Add both new events to the live-session panel in `app/analytics/page.tsx`; verify funnel renders the zero-count stage gracefully

## Phase 3: Verification

- [x] T111 New `tests/e2e/positions.spec.ts` per plan.md e2e scenario (credit position, theta gesture, close, analytics)
- [x] T112 Full local suite green: `npm run test`, `npm run build`, `npx playwright test`
- [ ] T113 Open implementation PR; independent review; address findings
- [ ] T114 Merge, deploy to Vercel, verify production e2e, update README feature list and roadmap status, refresh local talking points
