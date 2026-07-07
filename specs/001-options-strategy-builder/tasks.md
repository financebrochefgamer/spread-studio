# Tasks: Options Strategy Builder

**Input**: Design documents from `specs/001-options-strategy-builder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required. The constitution and plan require Vitest for domain math and
Playwright for the primary user journey.

**Organization**: Tasks are grouped by user story to preserve independent delivery and
traceability.

## Format: `[ID] [P?] [Story] Description`

- `[P]`: Can run in parallel because it touches different files and has no dependency on incomplete tasks.
- `[US#]`: Maps the task to a user story in spec.md.
- Every task includes an exact file path.

## Phase 1: Setup

**Purpose**: Initialize the Next.js app, test tooling, and base app shell.

- [ ] T001 Create Next.js project files in `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, and `eslint.config.mjs`
- [ ] T002 [P] Configure Tailwind and broker-grade global styles in `app/globals.css`
- [ ] T003 [P] Configure Vitest in `vitest.config.ts`
- [ ] T004 [P] Configure Playwright in `playwright.config.ts`
- [ ] T005 Create base app routes in `app/layout.tsx`, `app/page.tsx`, `app/orders/page.tsx`, and `app/analytics/page.tsx`

## Phase 2: Foundational Domain And State

**Purpose**: Core types, deterministic market data, pricing, payoff, analytics, persistence,
and state. User story work must wait until this phase is complete.

- [ ] T006 Define shared domain types in `lib/types.ts`
- [ ] T007 [P] Define market constants, fixed expirations, and 8 underlyings in `lib/market/constants.ts`
- [ ] T008 [P] Write Black-Scholes reference tests in `tests/unit/pricing.test.ts`
- [ ] T009 Implement Black-Scholes price and Greeks in `lib/pricing/blackScholes.ts`
- [ ] T010 [P] Write deterministic chain generation tests in `tests/unit/chains.test.ts`
- [ ] T011 Implement deterministic option chain generation in `lib/chains/generate.ts`
- [ ] T012 [P] Write payoff, breakeven, and max P/L tests in `tests/unit/payoff.test.ts`
- [ ] T013 Implement payoff analysis and unlimited detection in `lib/payoff/payoff.ts`
- [ ] T014 [P] Write analytics aggregation and storage tests in `tests/unit/analytics.test.ts`
- [ ] T015 Implement analytics event definitions, seed data, funnel aggregation, and browser storage in `lib/analytics/events.ts`, `lib/analytics/seed.ts`, `lib/analytics/funnel.ts`, and `lib/analytics/store.ts`
- [ ] T016 [P] Implement local order and strategy persistence in `lib/persist/orders.ts` and `lib/persist/strategies.ts`
- [ ] T017 Implement builder state and actions in `lib/state/builder.ts`

**Checkpoint**: Domain logic, persistence helpers, analytics helpers, and builder state are testable without UI.

## Phase 3: User Story 1 - Explore an option chain (Priority: P1)

**Goal**: A trader can select an underlying and expiration and inspect a deterministic option chain.

**Independent Test**: Select each underlying, switch expirations, reload, and verify quote fields remain deterministic.

- [ ] T018 [P] [US1] Build underlying and expiration controls in `components/UnderlyingPicker.tsx` and `components/ExpirationTabs.tsx`
- [ ] T019 [P] [US1] Build the option chain table in `components/ChainTable.tsx`
- [ ] T020 [US1] Wire the builder page chain workflow in `app/page.tsx`
- [ ] T021 [US1] Track initial `page_view` and `chain_viewed` events in `app/page.tsx`

**Checkpoint**: The app can display deterministic chains for all underlyings.

## Phase 4: User Story 2 - Build from strategy templates (Priority: P1)

**Goal**: A trader can apply any of the 9 named templates and get sensible same-expiration legs.

**Independent Test**: Apply each template and verify created legs match the expected strategy shape.

- [ ] T022 [P] [US2] Write template generation tests in `tests/unit/templates.test.ts`
- [ ] T023 [US2] Implement all 9 strategy templates in `lib/strategies/templates.ts`
- [ ] T024 [P] [US2] Build template selection controls in `components/TemplatePicker.tsx`
- [ ] T025 [US2] Wire template selection and `template_selected` tracking in `lib/state/builder.ts` and `app/page.tsx`

**Checkpoint**: The trader can build each template from the builder UI.

## Phase 5: User Story 3 - Edit custom strategy legs (Priority: P1)

**Goal**: A trader can add, update, and remove custom legs from the chain or leg editor.

**Independent Test**: Add a leg from the chain, edit side and quantity, then remove it and verify the strategy updates.

- [ ] T026 [P] [US3] Build the leg editor in `components/LegEditor.tsx`
- [ ] T027 [US3] Add chain-to-strategy leg actions in `components/ChainTable.tsx`
- [ ] T028 [US3] Add leg add, update, and remove actions with `leg_edited` tracking in `lib/state/builder.ts`
- [ ] T029 [US3] Integrate custom leg editing into the builder layout in `app/page.tsx`

**Checkpoint**: Custom strategy construction works without templates.

## Phase 6: User Story 4 - See live strategy risk (Priority: P1)

**Goal**: A trader sees payoff, breakevens, max P/L, net premium, and Greeks while building.

**Independent Test**: Build single-leg, vertical, and iron condor strategies and verify metrics update live.

- [ ] T030 [P] [US4] Build the payoff chart in `components/PayoffChart.tsx`
- [ ] T031 [P] [US4] Build metrics and Greeks tables in `components/MetricsGrid.tsx` and `components/GreeksTable.tsx`
- [ ] T032 [US4] Build the analysis panel in `components/AnalysisPanel.tsx`
- [ ] T033 [US4] Wire live analysis and `strategy_analyzed` tracking in `components/AnalysisPanel.tsx` and `app/page.tsx`

**Checkpoint**: The live risk picture is visible for any valid strategy.

## Phase 7: User Story 5 - Rehearse a simulated order (Priority: P2)

**Goal**: A trader opens a simulated order ticket, confirms a mid-price fill, and sees the order in history.

**Independent Test**: Build a strategy, confirm the ticket, navigate to Orders, and verify the order appears.

- [ ] T034 [P] [US5] Build the order ticket modal in `components/OrderTicketModal.tsx`
- [ ] T035 [US5] Wire order ticket open and confirm flows in `components/AnalysisPanel.tsx` and `components/OrderTicketModal.tsx`
- [ ] T036 [US5] Build simulated order history in `app/orders/page.tsx`
- [ ] T037 [US5] Track `order_ticket_opened` and `order_placed` events in `components/AnalysisPanel.tsx` and `components/OrderTicketModal.tsx`

**Checkpoint**: Simulated order flow is complete.

## Phase 8: User Story 6 - Save and reload strategies (Priority: P2)

**Goal**: A trader saves a strategy and reloads it later.

**Independent Test**: Save a custom strategy, leave the builder, reload the strategy, and verify legs and analysis return.

- [ ] T038 [US6] Add save strategy controls and `strategy_saved` tracking in `components/AnalysisPanel.tsx`
- [ ] T039 [US6] Add saved strategy list and reload actions in `app/orders/page.tsx` and `lib/state/builder.ts`

**Checkpoint**: Saved strategy round trip works locally.

## Phase 9: User Story 7 - Review product analytics (Priority: P3)

**Goal**: A product manager sees seeded funnel data, template popularity, and live session event counts.

**Independent Test**: Complete a builder-to-order flow, open analytics, and verify live session counts update.

- [ ] T040 [US7] Build analytics dashboard with funnel and template popularity in `app/analytics/page.tsx`
- [ ] T041 [US7] Audit all event firing sites against `docs/product/success-metrics.md`

**Checkpoint**: The analytics dashboard proves the tracking plan.

## Phase 10: End-To-End Verification, CI, Docs, And Shipping

**Purpose**: Prove the full product journey, publish the repo, and prepare portfolio materials.

- [ ] T042 [P] Write Playwright journey and save/load tests in `tests/e2e/journey.spec.ts`
- [ ] T043 Run and fix the full local suite using `npm run test`, `npm run build`, and `npm run test:e2e`
- [ ] T044 [P] Add GitHub Actions CI in `.github/workflows/ci.yml`
- [ ] T045 [P] Add screenshot capture test in `tests/e2e/screenshots.spec.ts`
- [ ] T046 Create README and process narrative in `README.md` and `docs/process/ai-workflow.md`
- [ ] T047 Capture README screenshots in `docs/images/`
- [ ] T048 Add remote-base-url e2e support in `playwright.config.ts`
- [ ] T049 Publish to GitHub and update README badge in `README.md`
- [ ] T050 Deploy to Vercel and update live demo URL in `README.md`
- [ ] T051 Verify production with Playwright against `PLAYWRIGHT_BASE_URL`
- [ ] T052 Create local interview talking points in `D:\spread-studio-notes\interview-talking-points.md`

## Dependencies And Execution Order

### Phase Dependencies

- Phase 1 has no dependencies.
- Phase 2 depends on Phase 1 and blocks user stories.
- Phases 3 through 6 are P1 and should be completed before P2 order and save work.
- Phases 7 and 8 depend on enough analysis UI to produce valid strategies.
- Phase 9 depends on instrumentation from prior phases.
- Phase 10 depends on the intended MVP user stories being complete.

### User Story Dependencies

- US1 can start after Phase 2.
- US2 can start after Phase 2 and benefits from US1 chain data.
- US3 can start after Phase 2 and benefits from US1 chain data.
- US4 can start after Phase 2 and needs strategy legs from US2 or US3.
- US5 depends on US4 for a valid strategy review surface.
- US6 depends on US3 and US4 for meaningful save/load behavior.
- US7 depends on event firing from US1 through US6.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel.
- T007, T008, T010, T012, T014, and T016 can run in parallel after T006.
- Component tasks marked [P] can run in parallel once their domain dependencies exist.
- T042, T044, and T045 can be prepared in parallel after the UI contracts stabilize.

## Parallel Examples

### Foundation

```text
Task: "T008 Write Black-Scholes reference tests in tests/unit/pricing.test.ts"
Task: "T010 Write deterministic chain generation tests in tests/unit/chains.test.ts"
Task: "T014 Write analytics aggregation and storage tests in tests/unit/analytics.test.ts"
```

### Builder UI

```text
Task: "T018 Build underlying and expiration controls in components/UnderlyingPicker.tsx and components/ExpirationTabs.tsx"
Task: "T019 Build the option chain table in components/ChainTable.tsx"
Task: "T024 Build template selection controls in components/TemplatePicker.tsx"
```

### Analysis UI

```text
Task: "T030 Build the payoff chart in components/PayoffChart.tsx"
Task: "T031 Build metrics and Greeks tables in components/MetricsGrid.tsx and components/GreeksTable.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 through US4.
3. Validate that a trader can inspect a chain, create a strategy, edit legs, and see risk.
4. Add US5 simulated order flow.
5. Add US7 analytics to prove the activation funnel.

### Incremental Delivery

1. Commit setup and domain modules first.
2. Commit each story with the task IDs it implements.
3. Keep tests passing at each checkpoint.
4. Defer only documented v1 exclusions.

## Notes

- After this file exists, implementation commit bodies should reference task IDs.
- Keep Codex/Claude deviations documented in `.superpowers/sdd/codex-handoff.md`.
- Do not add database, auth, external APIs, live market data, futures, margin modeling,
  calendars, or diagonals in v1.
