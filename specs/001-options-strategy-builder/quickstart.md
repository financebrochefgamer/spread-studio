# Quickstart: Options Strategy Builder

Date: 2026-07-06

## Prerequisites

- Node 20 or newer
- npm
- Chromium dependencies for Playwright when running e2e tests

## Setup

```powershell
npm install
```

## Run the app

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Unit tests

```powershell
npm run test
```

Expected result: pricing, chain generation, payoff, and analytics unit tests pass.

## End-to-end tests

```powershell
npx playwright install chromium
npm run test:e2e
```

Expected result: the trader journey passes.

## Manual validation journey

1. Open the builder.
2. Select `AURA`.
3. Apply the iron condor template.
4. Verify max loss is finite and breakevens are visible.
5. Open the simulated order ticket.
6. Confirm the order.
7. Open Orders and verify the order appears.
8. Open Analytics and verify live session counts updated.

## Expected scope checks

- No API keys are required.
- Refreshing the same selections produces the same quotes.
- Analytics shows seeded demo data before any live user action.
- Live data, margin, futures, calendars, and positions P/L are not present in v1.
