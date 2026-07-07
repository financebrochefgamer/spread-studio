# Tasks: Broker-Grade Order Entry

**Input**: spec.md (approved in PR #8, two review rounds) and plan.md in this directory.
**Tests**: Required per constitution. TDD for lib/orders, lib/persist/workingOrders;
Playwright for the two new order-entry journeys.

## Phase 1: Domain logic (TDD)

- [ ] T401 [TDD] Write failing test 1 from plan.md in `tests/unit/marketability.test.ts`, then implement `lib/orders/marketability.ts` (isMarketable) until green
- [ ] T402 [TDD] Write failing tests 2-5 from plan.md in `tests/unit/riskWarnings.test.ts`, then implement `lib/orders/riskWarnings.ts` (getRiskWarnings) until green
- [ ] T403 Add `WorkingOrder` interface and optional `timeInForce`/`orderType` fields on `Order` in `lib/types.ts`; add the two new event names to the `EventName` union (lib/types.ts) and `EVENT_NAMES` array (lib/analytics/events.ts)
- [ ] T404 [TDD] Write failing tests 6-8 from plan.md in `tests/unit/workingOrders.test.ts`, then implement `lib/persist/workingOrders.ts` (readWorkingOrders, writeWorkingOrders, addWorkingOrder, cancelWorkingOrder) until green, mirroring lib/persist/orders.ts's guarded pattern exactly

## Phase 2: UI wiring

- [ ] T405 Thread `analysis: AnalysisResult` from `AnalysisPanel`'s existing `analyzeStrategy` call down into `OrderTicketModal` as a new prop (no second `analyzeStrategy` call)
- [ ] T406 Add order type (market/limit), limit price input, and time-in-force controls to `OrderTicketModal`; wire `confirm()`'s branching per plan.md (marketable fills at netMid like today, non-marketable creates a WorkingOrder and fires `working_order_placed` instead of `order_placed`)
- [ ] T407 Render risk warnings (`getRiskWarnings`) above the confirm button in `OrderTicketModal`, informational only, using the exact testids from plan.md
- [ ] T408 Add the "Working Orders" section to `app/orders/page.tsx`: list, Cancel button firing `working_order_canceled`, re-read after cancel

## Phase 3: Verification and docs

- [ ] T409 New Playwright tests 9-11 from plan.md (non-marketable limit to working order to cancel; marketable limit fills like market; unlimited-risk warning is non-blocking)
- [ ] T410 Full local suite green: `npm run test`, `npm run build`, `npx playwright test`
- [ ] T411 Open implementation PR; independent review; address findings
- [ ] T412 Merge, deploy to Vercel, verify production e2e, update README feature list and docs/product/spec-queue.md status, refresh local talking points
